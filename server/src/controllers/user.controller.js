import User from "../models/User.js";
import { getEmbedding } from "../utils/embeddingClient.js";

export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};




export const updateMyProfile = async (req, res) => {
  try {
    const { 
      name, 
      bio, 
      skills, 
      interests, 
      preferredRoles,
      college,
      location,
      graduationYear,
      domainInterest
    } = req.body;

    // Validate required fields
    if (!name || name.trim() === "") {
      return res.status(400).json({ 
        success: false, 
        message: "Name is required" 
      });
    }

    // Sanitize and validate arrays
    const sanitizedSkills = Array.isArray(skills) 
      ? skills.map(skill => skill.trim()).filter(skill => skill !== "").slice(0, 20) // Limit to 20 skills
      : [];

    const sanitizedInterests = Array.isArray(interests)
      ? interests.map(interest => interest.trim()).filter(interest => interest !== "").slice(0, 15)
      : [];

    const sanitizedPreferredRoles = Array.isArray(preferredRoles)
      ? preferredRoles.map(role => role.trim()).filter(role => role !== "").slice(0, 10)
      : [];

    const sanitizedDomainInterest = Array.isArray(domainInterest)
      ? domainInterest.map(domain => domain.trim()).filter(domain => domain !== "").slice(0, 10)
      : [];

    // Validate graduation year
    if (graduationYear && (isNaN(graduationYear) || graduationYear < 2000 || graduationYear > 2030)) {
      return res.status(400).json({
        success: false,
        message: "Graduation year must be between 2000 and 2030"
      });
    }

    // Prepare text for embedding - include all relevant profile data
    const embeddingTextParts = [];
    
    if (bio && bio.trim()) embeddingTextParts.push(bio.trim());
    if (sanitizedSkills.length > 0) embeddingTextParts.push(...sanitizedSkills);
    if (sanitizedInterests.length > 0) embeddingTextParts.push(...sanitizedInterests);
    if (sanitizedPreferredRoles.length > 0) embeddingTextParts.push(...sanitizedPreferredRoles);
    if (sanitizedDomainInterest.length > 0) embeddingTextParts.push(...sanitizedDomainInterest);
    if (college && college.trim()) embeddingTextParts.push(college.trim());
    if (location && location.trim()) embeddingTextParts.push(location.trim());

    let embedding = [];
    
    // Only generate embedding if we have meaningful text
    if (embeddingTextParts.length > 0) {
      const textToEmbed = embeddingTextParts.join(" ");
      
      try {
        console.log(`🧠 Generating embedding for profile update (${textToEmbed.length} chars)`);
        embedding = await getEmbedding(textToEmbed);
        
        if (!embedding || embedding.length === 0) {
          console.warn("⚠️ Empty embedding received from service");
        } else {
          console.log(`✅ Embedding generated successfully (${embedding.length} dimensions)`);
        }
      } catch (err) {
        console.error(`❌ Embedding service error: ${err.message}`);
        // Continue without embedding - don't fail the entire update
      }
    } else {
      console.log("ℹ️ No meaningful text for embedding generation");
    }

    // Build updates object
    const updates = {
      name: name.trim(),
      ...(bio !== undefined && { bio: bio.trim() }),
      ...(college !== undefined && { college: college.trim() }),
      ...(location !== undefined && { location: location.trim() }),
      ...(graduationYear !== undefined && { graduationYear: graduationYear ? parseInt(graduationYear) : null }),
      skills: sanitizedSkills,
      interests: sanitizedInterests,
      preferredRoles: sanitizedPreferredRoles,
      domainInterest: sanitizedDomainInterest,
      ...(embedding.length > 0 && { profileEmbedding: embedding }),
      // Clear embedding if no meaningful data was provided
      ...(embedding.length === 0 && embeddingTextParts.length === 0 && { profileEmbedding: [] })
    };

    // Remove undefined values
    Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

    console.log(`📝 Updating profile for user: ${req.user._id}`);
    
    const user = await User.findByIdAndUpdate(
      req.user._id, 
      updates, 
      { 
        new: true,
        runValidators: true // Ensure schema validations run
      }
    ).select("-password -__v");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    console.log(`✅ Profile updated successfully for: ${user.name}`);
    
    res.json({ 
      success: true, 
      user,
      message: "Profile updated successfully",
      embeddingGenerated: embedding.length > 0
    });

  } catch (err) {
    console.error("❌ Profile update error:", err);
    
    // Handle specific MongoDB errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(error => error.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors
      });
    }
    
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }

    res.status(500).json({ 
      success: false, 
      message: "Failed to update profile",
      ...(process.env.NODE_ENV === 'development' && { error: err.message })
    });
  }
};


