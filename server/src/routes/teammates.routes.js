import express from "express";
import auth from "../middleware/auth.js";
import User from "../models/User.js";
import { getEmbedding, getSimilarity } from "../utils/embeddingClient.js";

const router = express.Router();

/* --------------------------
   Helper: Cosine Similarity
-------------------------- */
function cosine(a, b) {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const magB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  return dot / (magA * magB);
}

/* -------------------------------------------
   🔍 1. Search Teammates by Keyword + Filters
------------------------------------------- */



// 🔍 Find teammates with filters
router.post("/find", auth, async (req, res) => {
  try {
    const { query, filters } = req.body;
    
    // Validate query
    if (!query || query.trim() === "") {
      return res.status(400).json({ 
        success: false, 
        message: "Search query is required" 
      });
    }

    // Call embedding service
    const queryEmb = await getEmbedding(query.trim());

    // Build base query
    let userQuery = {
      profileEmbedding: { $exists: true, $ne: [] },
      _id: { $ne: req.user._id }
    };

    // Apply filters if provided
    if (filters) {
      // College filter (case-insensitive partial match)
      if (filters.college && filters.college.trim() !== "") {
        userQuery.college = { 
          $regex: filters.college.trim(), 
          $options: "i" 
        };
      }

      // Location filter (case-insensitive partial match)
      if (filters.location && filters.location.trim() !== "") {
        userQuery.location = { 
          $regex: filters.location.trim(), 
          $options: "i" 
        };
      }

      // Domain interest filter (exact match in array)
      if (filters.domainInterest && Array.isArray(filters.domainInterest) && filters.domainInterest.length > 0) {
        userQuery.domainInterest = { 
          $in: filters.domainInterest.map(d => d.trim()).filter(d => d !== "")
        };
      }

      // Skills filter (exact match in array)
      if (filters.skills && filters.skills.trim() !== "") {
        const skillsArray = filters.skills.split(',').map(skill => skill.trim()).filter(skill => skill !== "");
        if (skillsArray.length > 0) {
          userQuery.skills = { $in: skillsArray };
        }
      }

      // Graduation year range filter
      if (filters.gradYearRange && Array.isArray(filters.gradYearRange) && filters.gradYearRange.length === 2) {
        const [minYear, maxYear] = filters.gradYearRange;
        if (minYear && maxYear && minYear <= maxYear) {
          userQuery.graduationYear = { 
            $gte: parseInt(minYear), 
            $lte: parseInt(maxYear) 
          };
        }
      }
    }

    // Fetch users with embeddings and apply filters
    const users = await User.find(
      userQuery,
      "name email bio skills interests college location graduationYear domainInterest preferredRoles profileEmbedding"
    ).lean();

    // If no users found with filters, return empty results
    if (users.length === 0) {
      return res.json({ 
        success: true, 
        results: [],
        message: "No teammates found matching your criteria"
      });
    }

    // Compute similarity scores
    const results = users.map((user) => {
      const similarity = cosine(queryEmb, user.profileEmbedding);
      return {
        ...user,
        similarity: similarity,
        // Remove embedding from response to reduce payload size
        profileEmbedding: undefined
      };
    });

    // Sort by similarity score (descending)
    results.sort((a, b) => b.similarity - a.similarity);

    // Return top 15 results (increased from 10 for better filtering)
    const topResults = results.slice(0, 15);

    res.json({ 
      success: true, 
      results: topResults,
      count: topResults.length,
      totalMatches: results.length
    });

  } catch (err) {
    console.error("Find teammates error:", err);
    
    // More specific error messages
    let errorMessage = "Failed to search teammates";
    let statusCode = 500;

    if (err.name === "CastError") {
      errorMessage = "Invalid filter format";
      statusCode = 400;
    } else if (err.message?.includes("embedding")) {
      errorMessage = "Search service temporarily unavailable";
      statusCode = 503;
    }

    res.status(statusCode).json({ 
      success: false, 
      message: errorMessage,
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
});



/* --------------------------------------------
   🧠 2. Smart AI Recommendations + Filters
-------------------------------------------- */
router.post("/recommend", auth, async (req, res) => {
  try {
    const { filters = {} } = req.body;

    // Get current user with all relevant fields
    const currentUser = await User.findById(req.user._id).select(
      "name bio skills interests preferredRoles college location graduationYear domainInterest profileEmbedding"
    );

    if (!currentUser) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    if (!currentUser?.profileEmbedding?.length) {
      return res.status(400).json({ 
        success: false, 
        message: "Please update your profile with skills and interests to get recommendations." 
      });
    }

    // Build filter query
    let query = {
      profileEmbedding: { $exists: true, $ne: [] },
      _id: { $ne: req.user._id },
    };

    // Apply filters
    if (filters.college && filters.college.trim() !== "") {
      query.college = { $regex: filters.college.trim(), $options: "i" };
    }

    if (filters.location && filters.location.trim() !== "") {
      query.location = { $regex: filters.location.trim(), $options: "i" };
    }

    if (filters.domainInterest?.length > 0) {
      query.domainInterest = { 
        $in: filters.domainInterest.map(d => d.trim()).filter(d => d !== "")
      };
    }

    if (filters.gradYearRange && filters.gradYearRange.length === 2) {
      const [minYear, maxYear] = filters.gradYearRange;
      if (minYear && maxYear && minYear <= maxYear) {
        query.graduationYear = { 
          $gte: parseInt(minYear), 
          $lte: parseInt(maxYear) 
        };
      }
    }

    // Skills filter for complementary skills
    if (filters.skills && filters.skills.trim() !== "") {
      const desiredSkills = filters.skills.split(',').map(s => s.trim()).filter(s => s !== "");
      if (desiredSkills.length > 0) {
        query.skills = { $in: desiredSkills };
      }
    }

    console.log(`🔍 Finding recommendations for user: ${currentUser.name}`);
    console.log(`📊 Filter query:`, JSON.stringify(query, null, 2));

    const users = await User.find(query).select(
      "name bio skills interests preferredRoles college location graduationYear domainInterest profileEmbedding avatar xp level"
    ).limit(50); // Limit for performance

    if (users.length === 0) {
      return res.json({ 
        success: true, 
        recommended: [],
        message: "No users found matching your criteria. Try adjusting your filters."
      });
    }

    console.log(`🎯 Computing recommendations from ${users.length} potential matches...`);

    // Compute scores for each user
    const results = await Promise.all(
      users.map(async (user) => {
        try {
          // 1. Profile similarity (40% weight)
          const profileSimilarity = await getSimilarity(
            currentUser.profileEmbedding, 
            user.profileEmbedding
          );

          // 2. Skills complementarity (30% weight)
          const userSkills = new Set(user.skills || []);
          const currentUserSkills = new Set(currentUser.skills || []);
          
          // Unique skills this user brings
          const uniqueSkills = [...userSkills].filter(skill => !currentUserSkills.has(skill));
          const skillsComplementarity = Math.min(uniqueSkills.length / 10, 1); // Normalize

          // 3. Role complementarity (20% weight)
          const userRoles = new Set(user.preferredRoles || []);
          const currentUserRoles = new Set(currentUser.preferredRoles || []);
          
          const sharedRoles = [...userRoles].filter(role => currentUserRoles.has(role));
          const uniqueRoles = [...userRoles].filter(role => !currentUserRoles.has(role));
          
          // Balance: some shared roles (team understanding) + some unique roles (diversity)
          const roleComplementarity = (sharedRoles.length * 0.3 + uniqueRoles.length * 0.7) / 
            Math.max(userRoles.size, 1);

          // 4. Domain alignment (10% weight)
          const userDomains = new Set(user.domainInterest || []);
          const currentUserDomains = new Set(currentUser.domainInterest || []);
          const sharedDomains = [...userDomains].filter(domain => currentUserDomains.has(domain));
          const domainAlignment = sharedDomains.length / Math.max(userDomains.size, 1);

          // 5. Filter boosts
          let filterBoost = 1;
          if (filters.college && user.college === currentUser.college) filterBoost += 0.2;
          if (filters.location && user.location === currentUser.location) filterBoost += 0.15;
          if (filters.domainInterest?.length > 0 && 
              user.domainInterest?.some(d => filters.domainInterest.includes(d))) {
            filterBoost += 0.1;
          }

          // Calculate final score
          const score = (
            profileSimilarity * 0.4 +
            skillsComplementarity * 0.3 +
            roleComplementarity * 0.2 +
            domainAlignment * 0.1
          ) * filterBoost;

          return {
            _id: user._id,
            name: user.name,
            bio: user.bio,
            avatar: user.avatar,
            college: user.college,
            location: user.location,
            graduationYear: user.graduationYear,
            domainInterest: user.domainInterest,
            skills: user.skills,
            preferredRoles: user.preferredRoles,
            interests: user.interests,
            xp: user.xp,
            level: user.level,
            similarity: profileSimilarity,
            skillsComplementarity,
            roleComplementarity,
            domainAlignment,
            score,
            matchReasons: generateMatchReasons({
              profileSimilarity,
              skillsComplementarity,
              uniqueSkills,
              sharedRoles,
              uniqueRoles,
              sharedDomains,
              user,
              currentUser
            })
          };
        } catch (err) {
          console.error(`❌ Error computing score for user ${user.name}:`, err);
          return null;
        }
      })
    );

    // Filter out failed computations and sort
    const validResults = results.filter(r => r !== null);
    validResults.sort((a, b) => b.score - a.score);

    const topRecommendations = validResults.slice(0, 8); // Return top 8

    console.log(`✅ Generated ${topRecommendations.length} recommendations`);

    res.json({ 
      success: true, 
      recommended: topRecommendations,
      metrics: {
        totalConsidered: users.length,
        totalRecommended: topRecommendations.length,
        averageScore: topRecommendations.length > 0 
          ? topRecommendations.reduce((sum, r) => sum + r.score, 0) / topRecommendations.length 
          : 0
      }
    });

  } catch (err) {
    console.error("❌ Recommend teammates error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to generate recommendations",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Helper function to generate match reasons
function generateMatchReasons({
  profileSimilarity,
  skillsComplementarity,
  uniqueSkills,
  sharedRoles,
  uniqueRoles,
  sharedDomains,
  user,
  currentUser
}) {
  const reasons = [];

  if (profileSimilarity > 0.7) {
    reasons.push("High profile compatibility");
  } else if (profileSimilarity > 0.5) {
    reasons.push("Good profile match");
  }

  if (skillsComplementarity > 0.7) {
    reasons.push("Brings many new skills");
  } else if (skillsComplementarity > 0.3) {
    reasons.push("Offers complementary skills");
  }

  if (uniqueSkills.length > 0) {
    reasons.push(`Adds skills: ${uniqueSkills.slice(0, 3).join(", ")}`);
  }

  if (sharedRoles.length > 0) {
    reasons.push(`Shared roles: ${sharedRoles.slice(0, 2).join(", ")}`);
  }

  if (uniqueRoles.length > 0) {
    reasons.push(`New roles: ${uniqueRoles.slice(0, 2).join(", ")}`);
  }

  if (sharedDomains.length > 0) {
    reasons.push(`Shared interests: ${sharedDomains.slice(0, 2).join(", ")}`);
  }

  // College/location matches
  if (user.college && currentUser.college && user.college === currentUser.college) {
    reasons.push("Same college");
  }

  if (user.location && currentUser.location && user.location === currentUser.location) {
    reasons.push("Same location");
  }

  return reasons.slice(0, 4); // Limit to top 4 reasons
}

/* --------------------------------------------
   ⚙️ 3. Auto Balanced Team Formation
-------------------------------------------- */
router.get("/form-teams", auth, async (req, res) => {
  try {
    const allUsers = await User.find(
      { profileEmbedding: { $exists: true, $ne: [] } },
      "name bio skills preferredRoles profileEmbedding"
    );

    if (allUsers.length < 3)
      return res.status(400).json({ message: "Not enough users to form teams." });

    const matrix = [];
    for (let i = 0; i < allUsers.length; i++) {
      matrix[i] = [];
      for (let j = 0; j < allUsers.length; j++) {
        matrix[i][j] =
          i === j
            ? 0
            : cosine(allUsers[i].profileEmbedding, allUsers[j].profileEmbedding);
      }
    }

    const used = new Set();
    const teams = [];

    for (let i = 0; i < allUsers.length; i++) {
      if (used.has(i)) continue;

      let bestCombo = null;
      let bestScore = -1;

      for (let j = i + 1; j < allUsers.length; j++) {
        if (used.has(j)) continue;
        for (let k = j + 1; k < allUsers.length; k++) {
          if (used.has(k)) continue;

          const simAvg =
            (matrix[i][j] + matrix[i][k] + matrix[j][k]) / 3;

          const roles = new Set([
            ...allUsers[i].preferredRoles,
            ...allUsers[j].preferredRoles,
            ...allUsers[k].preferredRoles,
          ]);
          const diversity = roles.size / 3;
          const score = simAvg * 0.7 + diversity * 0.3;

          if (score > bestScore) {
            bestScore = score;
            bestCombo = [i, j, k];
          }
        }
      }

      if (bestCombo) {
        teams.push({
          members: bestCombo.map((idx) => ({
            name: allUsers[idx].name,
            roles: allUsers[idx].preferredRoles,
            skills: allUsers[idx].skills,
          })),
          teamScore: bestScore.toFixed(3),
        });
        bestCombo.forEach((idx) => used.add(idx));
      }
    }

    res.json({ success: true, teams });
  } catch (err) {
    console.error("Team formation error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
