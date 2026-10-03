import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    // User reference (one-to-one relationship)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      unique: true, // Each user can have only ONE profile
    },

    // Bio / About section
    bio: {
      type: String,
      trim: true,
      maxlength: [500, "Bio cannot exceed 500 characters"],
      default: "",
    },

    // Job title or role
    jobTitle: {
      type: String,
      trim: true,
      maxlength: [100, "Job title cannot exceed 100 characters"],
      default: "",
    },

    // Department or team (optional)
    department: {
      type: String,
      trim: true,
      maxlength: [100, "Department cannot exceed 100 characters"],
      default: "",
    },

    // Phone number (optional)
    phone: {
      type: String,
      trim: true,
      default: "",
    },

    // Location (city, country)
    location: {
      type: String,
      trim: true,
      maxlength: [100, "Location cannot exceed 100 characters"],
      default: "",
    },

    // Profile image URL (Cloudinary or any storage)
    avatar: {
      type: String,
      default: "",
    },

    // Social links (optional)
    socialLinks: {
      github: {
        type: String,
        default: "",
      },
      linkedin: {
        type: String,
        default: "",
      },
      twitter: {
        type: String,
        default: "",
      },
      website: {
        type: String,
        default: "",
      },
    },
    theme: {
  type: String,
  enum: ["light", "dark", "system"],
  default: "light",
},

    // Skills (array of strings - optional)
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Profile = mongoose.model("Profile", profileSchema);

export default Profile;