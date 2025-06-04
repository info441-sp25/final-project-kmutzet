# InspoNest

**Contributors:** Samuel Shumye, Kate Muret, Joseph Tran

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
- Includes features like drag-and-drop reordering and real-time updates
- Encourages creative expression and visual storytelling

## 🛠 Technical Description

### Architecture Overview

- **Frontend:** React
- **Backend:** Node.js + Express
- **Database:** MongoDB (users, boards, images)
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
| P0       | As a user, I want to create new boards to organize my saved content        | POST to Express API → MongoDB |
| P0       | As a user, I want to upload and save an image with a caption and board     | Upload to Cloudinary, store URL + metadata in MongoDB |
| P0       | As a user, I want to view my boards and the content I’ve saved             | GET request → MongoDB |
| P1       | As a user, I want to browse public boards from other users                 | Query MongoDB for public boards |
| P1       | As a user, I want to like and comment on images or boards                  | MongoDB fields + POST endpoints |
| P1       | As a user, I want to edit or delete my boards and saved content            | PUT and DELETE routes with auth checks |
| P2       | As a user, I want to search for boards or content by keyword or tag        | MongoDB text search |
| P2       | As a user, I want to follow users and see their new boards on my feed      | Simple follow schema + feed endpoint |

---
### Available Endpoints

- `POST /user/register` – Create new user account  
- `POST /user/login` – Authenticate and return user data  
- `GET /user/:id/posts` – Get all posts for a user  
- `POST /boards/create` – Create a new board  
- `GET /boards/:id` – Retrieve specific board and images  
- `POST /images/upload` – Upload image (via Cloudinary), link to board  
- `POST /images/:id/comment` – Add comment to image  
- `POST /boards/:id/like` – Like a board  
- `PUT /boards/:id` – Update board title/visibility  
- `DELETE /boards/:id` – Delete board  
- `GET /explore` – View public boards  
- `GET /search?q=tag` – Search boards/images by tag or title  

---

## 🗃 Database Schemas (Appendix)

### Users

```json
{
  "userID": ObjectId,
  "username": String,
  "email": String,
  "passwordHash": String,
  "bio": String,
  "followers": [ObjectId],
  "following": [ObjectId]
}
```

### Posts
```json
{
  "boardID": ObjectId,
  "userID": ObjectId,
  "title": String,
  "description": String,
  "isPublic": Boolean,
  "images": [ObjectId],
  "createdAt": Date
}
```

### Images
```json
{
  "imageID": ObjectId,
  "boardID": ObjectId,
  "userID": ObjectId,
  "imageURL": String,
  "caption": String,
  "tags": [String],
  "likes": [ObjectId],
  "comments": [
    {
      "userID": ObjectId,
      "comment": String,
      "timestamp": Date
    }
  ],
  "createdAt": Date
}
```

