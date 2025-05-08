import mongoose, { Document, Schema } from 'mongoose';

export interface IDiscussion extends Document {
  content: string;
  createdBy: mongoose.Types.ObjectId;
  subject: string;
  parentId: mongoose.Types.ObjectId | null;
  like: number;
  dislike: number;
  comment: number;
}

const DiscussionSchema = new Schema<IDiscussion>({
    content:{
        type: String,
        required: [true, "Content is required"],
        trim: true,
    },
    createdBy:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "CreatedBy is required"],
    },
    subject:{
        type: String,
        required: [true, "Subject is required"],
        trim: true,
    },
    parentId:{
        type: Schema.Types.ObjectId,
        ref: "Discussion",
        default: null,
    },
    like:{
        type: Number,
        default: 0,
    },
    dislike:{
        type: Number,
        default: 0,
    },
    comment:{   
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,}
);

// Create indexes for efficient queries
DiscussionSchema.index({ createdBy: 1 });
DiscussionSchema.index({ subject: 1 });
DiscussionSchema.index({ parentId: 1 });

// Export the model
const Discussion = mongoose.models.Discussion || mongoose.model<IDiscussion>('Discussion', DiscussionSchema);

export default Discussion;
