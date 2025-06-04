# InspoNest

**Contributors:** Samuel Shumye, Kate Muret, Joseph Tran

[Link to Deployed Site](https://final-project.katemuret.me)
## 📌 Project Description

**InspoNest** is a web-based visual bookmarking and inspiration platform modeled after Pinterest, designed specifically for college students and young creatives. Whether you're seeking ideas for fashion, interior design, art, food, or lifestyle, InspoNest helps you collect, organize, and revisit visual content in a meaningful way.

Our primary users are students or early-career creatives who want to:
- Curate aesthetic posts
- Save and categorize inspiring content
- Discover new trends through a visually engaging platform

This app fills a gap for users who are overwhelmed by the volume of content online and want a clean, collaborative, and community-driven digital space. InspoNest helps them create cohesive, aesthetic collections they can return to for creativity and motivation.

As developers, we’re excited about this project because it:
- Combines frontend and backend challenges
- Requires thoughtful UI/UX design
- Encourages creative expression and visual storytelling

## 🛠 Technical Description

### Architecture Overview

- **Frontend:** React
- **Backend:** Node.js + Express
- **Database:** MongoDB (users, posts, etc)
- **Media Uploads:** Cloudinary (images)
- **Authentication:** Azure
- **API Design:** RESTful routes

<img width="782" alt="PNG image" src="https://github.com/user-attachments/assets/48d43d32-649b-42b7-a521-6948571819f9" />

---

## Data Flow
<img width="706" alt="PNG image" src="https://github.com/user-attachments/assets/bc7e5202-a88c-40db-972a-05f896c8cbbd" />

---

## 🧑‍💻 User Story Summary

| Priority | User Story                                                                 | Technical Implementation |
|----------|-----------------------------------------------------------------------------|---------------------------|
| P0       | As a user, I want to create an account and log in/out                      | Azure Authentication + MongoDB |
| P0       | As a user, I want to create new posts          | POST to Express API → MongoDB |
| P0       | As a user, I want to upload and save an image with a caption     | Upload to Cloudinary, store URL + metadata in MongoDB |
| P0       | As a user, I want to view my posts and the content I’ve saved/liked             | GET request → MongoDB |
| P1       | As a user, I want to browse posts from other users                 | Query MongoDB for posts by username |
| P1       | As a user, I want to like and comment on posts                | MongoDB fields + POST endpoints |
| P1       | As a user, I want to edit or delete my posts       | PUT and DELETE routes with auth checks |
| P2       | As a user, I want to search for posts by keyword or tag        | MongoDB text search |

---
### Available Endpoints

- `POST /user/register` – Create new user account  
- `POST /user/login` – Authenticate and return user data  
- `GET /posts` – Get all posts (or by username or likedBy query param)
- `POST /posts` – Create a new post  
- `PUT /posts` – Update an existing post (description)  
- `DELETE /posts/` – Delete a post  
- `POST /posts/like` – Like a post  
- `POST /posts/unlike` – Unlike a post
- `GET /posts/search?q=term` – Search posts by tags or description
- `POST /images/upload` – Like a post  
- `POST /comments` – Add a comment to a post

---

## 🗃 Database Schemas (Appendix)

### Users

```json
{
  "_id": ObjectId,
  "username": String,
  "profileBio": String,
  "avatarUrl": String
}
```

### Posts
```json
{
  "_id": ObjectId,
  "username": String,
  "description": String,
  "mediaUrl": String,
  "created_date": Date,
  "likes": [String],
  "image": {
    "public_id": String,
    "url": String
  },
  "imageURLs": [String],
  "htmlPreview": String,
  "tags": [String]
}
```

### Comments
```json
{
  "_id": ObjectId,
  "username": String,
  "comment": String,
  "created_date": Date,
  "post": ObjectId  // references Posts._id
}
```

