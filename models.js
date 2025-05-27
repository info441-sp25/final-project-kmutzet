import mongoose from 'mongoose';

let models = {};

main()

async function main() {
    await mongoose.connect('mongodb+srv://kmuret:passworddd@cluster0.o9sjsfo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
    console.log('Connected to MongoDB');

    //schema
    const postSchema = new mongoose.Schema({
        mediaUrl: String,
        description: String,
        created_date: { type: Date, default: Date.now },
        username: String,
        likes: [String],
        image: {
            public_id: String,
            url: String,
        },
        imageURLs: {
            type: [String],    // array of strings (URLs)
            default: [],
        },
        htmlPreview: {
            type: String,
            default: '',
        }
    });


    models.Post = mongoose.model('Post', postSchema);

    const commentSchema = new mongoose.Schema({
        username: String,
        comment: String,
        created_date: Date,
        post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    })

    models.Comment = mongoose.model('Comment', commentSchema);
    console.log("Model created");

    const userInfoSchema = new mongoose.Schema({
        username: String,
        profileBio: String,
        avatarUrl: String,
    })
    models.UserInfo = mongoose.model('UserInfo', userInfoSchema)
    console.log("userInfo model created");
};

export default models;
