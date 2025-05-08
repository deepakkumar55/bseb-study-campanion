import mongoose, { Document, Schema } from "mongoose";

export interface INote extends Document{
    title: string;
    subject: string;
    chapter: string;
    topic: string;
    description: string;
    content?: string;
    type: "text" | "pdf" | "image" | "video";
    tags: string[];
    fileUrl?: string;
    isHandwritten: boolean;
    uploadedBy: mongoose.Types.ObjectId;
    views: number;
    likes: number;
}

const NoteSchema = new Schema<INote>(
    {
        title:{
            type: String,
            required: [true, "Title is required"],
            trim: true,
        },
        subject:{
            type: String,
            required: [true, "Subject is required"],
            trim: true,
        },
        chapter:{
            type: String,
            required: [true, "Chapter is required"],
            trim: true,
        },
        topic:{
            type: String,
            required: [true, "Topic is required"],
            trim: true,
        },
        description:{
            type: String,
            required: [true, "Description is required"],
            trim: true,
        },
        content:{
            type:String,

        },
        type:{
            type: String,
            enum: ["text", "pdf", "image", "video"],
            required: [true, "Type is required"],
        },
        tags:{
            type: [String],
            default: [],
        },
        fileUrl:{
            type: String,
        },
        isHandwritten:{
            type: Boolean,
            default: false,
        },
        uploadedBy:{
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Uploader is required"],
        },
        views:{
            type: Number,
            default: 0,
        },
        likes:{
            type: Number,
            default: 0,
        },
    },
    { timestamps: true}
)


// Validate the note schema
NoteSchema.pre<INote>("validate", function (next) {
    if(!this.content && !this.fileUrl) {
        next(new Error("Either content or fileUrl must be provided"));
    }
    next();
}
);

const Note = mongoose.models.Note || mongoose.model<INote>("Note", NoteSchema);
export default Note;