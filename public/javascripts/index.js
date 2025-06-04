async function init(){
    let urlInput = document.getElementById("urlInput");
    if (urlInput) {
        urlInput.onkeyup = previewUrl;
        urlInput.onchange = previewUrl;
        urlInput.onclick = previewUrl;
    }

    await loadIdentity();
    loadPosts();

    document.getElementById('imageInput').addEventListener('change', function () {
        const fileNameDisplay = document.getElementById('fileNameDisplay');
        if (this.files.length > 0) {
            fileNameDisplay.value = this.files[0].name;
        } else {
            fileNameDisplay.value = "No file chosen";
        }
    });
}


async function uploadImageToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "inspo_preset"); // your unsigned preset name

  const res = await fetch("https://api.cloudinary.com/v1_1/dumon31ph/image/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Cloudinary upload failed");

  const data = await res.json();
  return data.secure_url; // This is the public URL of the image
}

async function loadPosts(){
    document.getElementById("posts_box").innerText = "Loading...";
    let postsJson = await fetchJSON(`api/${apiVersion}/posts`)
    
    let postsHtml = postsJson.map(postInfo => {
    const imageHTML = postInfo.imageURLs?.map(url => 
        `<img src="${escapeHTML(url)}" alt="post image" class="img-fluid mb-2">`
    ).join("") || "";

    return `
        <div class="card mb-4 shadow-sm position-relative">
            <div class="card-body">
                <div class="delete-row d-flex justify-content-end">
                ${postInfo.username === myIdentity
                    ? `<button class="btn btn-sm btn-outline-primary me-auto" id="edit-btn-${postInfo.id}" onclick='toggleEdit("${postInfo.id}")'>Edit</button>
                    <button class="delete-button" onclick='deletePost("${postInfo.id}")'>&times;</button>`
                    : ""}
                </div>

                <div>
                <div class="image-container d-flex justify-content-center mb-2">
                    ${imageHTML}
                </div>
                ${postInfo.htmlPreview || ""}
                <p class="text-muted small">
                    <a href="/userInfo.html?user=${encodeURIComponent(postInfo.username)}">${escapeHTML(postInfo.username)}</a>, ${escapeHTML(postInfo.created_date)}
                </p>
                <div class="d-flex justify-content-between align-items-start">
                    <p class="card-text flex-grow-1 me-2" id="desc-text-${postInfo.id}">${escapeHTML(postInfo.description)}</p>
                    <textarea class="form-control d-none" id="desc-edit-${postInfo.id}" style="flex-grow:1; resize:none;" rows="3">${escapeHTML(postInfo.description)}</textarea>
                </div>
                <div class="d-flex align-items-center">
                    <span class="me-2" title="${postInfo.likes ? escapeHTML(postInfo.likes.join(", ")) : ""}">
                        ${postInfo.likes ? `${postInfo.likes.length}` : 0} likes
                    </span>

                    <span class="${myIdentity ? '' : 'd-none'}">
                        ${postInfo.likes && postInfo.likes.includes(myIdentity)
                        ? `<button class="btn btn-sm btn-outline-danger" onclick='unlikePost("${postInfo.id}")'>&#x2665;</button>`
                        : `<button class="btn btn-sm btn-outline-secondary" onclick='likePost("${postInfo.id}")'>&#x2661;</button>`}
                    </span>
                </div>

                <button class="btn btn-link mt-2" onclick='toggleComments("${postInfo.id}")'>View/Hide comments</button>
                <div id='comments-box-${postInfo.id}' class="comments-box d-none">
                    <button class="btn btn-sm btn-secondary mb-2" onclick='refreshComments("${postInfo.id}")'>Refresh comments</button>
                    <div id='comments-${postInfo.id}'></div>
                    <div class="new-comment-box ${myIdentity ? "" : "d-none"}">
                        <textarea class="form-control mb-2" id="new-comment-${postInfo.id}" placeholder="Write a comment..."></textarea>
                        <button class="btn btn-primary btn-sm" onclick='postComment("${postInfo.id}")'>Post Comment</button>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
}).join("");

    document.getElementById("posts_box").innerHTML = postsHtml;
}

function makeUrlPreview(imageUrl) {
    return `<img src="${escapeHTML(imageUrl)}" alt="Image preview" class="img-fluid"/>`;
}

async function deletePost(postID) {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
        const res = await fetch(`api/${apiVersion}/posts`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ postID }),
        });

        const result = await res.json();
        if (result.status === "success") {
            alert("Post deleted successfully.");
            loadPosts(); // Reload posts
        } else {
            alert("Failed to delete post: " + result.error);
        }
    } catch (error) {
        console.error("Error deleting post:", error);
        alert("An unexpected error occurred.");
    }
}

function toggleEdit(postID) {
  const descText = document.getElementById(`desc-text-${postID}`);
  const descEdit = document.getElementById(`desc-edit-${postID}`);
  const editBtn = document.getElementById(`edit-btn-${postID}`);

  if (editBtn.textContent === "Edit") {
    // Switch to editing mode
    descText.classList.add("d-none");
    descEdit.classList.remove("d-none");
    editBtn.textContent = "Save";
  } else {
    // Save the new description
    const newDesc = descEdit.value.trim();

    if (newDesc.length === 0) {
      alert("Description cannot be empty.");
      return;
    }

    updatePost(postID, newDesc);
  }
}

async function updatePost(postID, newDescription) {
  try {
    console.log("Sending PUT request to update post", postID, newDescription);

    const res = await fetch(`/api/v1/posts`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postID: postID, description: newDescription })
    });

    console.log("Response status:", res.status);

    // If response is not ok, log the raw text to see the response body
    if (!res.ok) {
      const text = await res.text();
      console.error("Non-OK response body:", text);
      alert(`Failed to update post: Server responded with status ${res.status}`);
      return;
    }

    const result = await res.json();
    console.log("Parsed response JSON:", result);

    if (result.status === "success") {
      document.getElementById(`desc-text-${postID}`).textContent = newDescription;
      document.getElementById(`desc-text-${postID}`).classList.remove("d-none");

      document.getElementById(`desc-edit-${postID}`).classList.add("d-none");

      document.getElementById(`edit-btn-${postID}`).textContent = "Edit";

      alert("Post updated successfully.");
    } else {
      alert("Failed to update post: " + result.error);
    }
  } catch (error) {
    console.error("Error updating post:", error);
    alert("An unexpected error occurred while updating the post.");
  }
}





async function postUrl() {
  const description = document.getElementById("descriptionInput").value;
  const imageFile = document.getElementById("imageInput").files[0];

  if (!imageFile || !description) {
    alert("Both description and image are required.");
    return;
  }

  try {
    const imageUrl = await uploadImageToCloudinary(imageFile);
    let htmlPreview = makeUrlPreview(imageUrl);
    const response = await fetch(`api/${apiVersion}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            description: description,
            htmlPreview: htmlPreview,
            imageURLs: [imageUrl],
            boardID: "default",
        }),
    });


    const data = await response.json();
    if (data.status === "success") {
      document.getElementById("postStatus").textContent = "✅ Posted!";
      loadPosts(); // refresh posts
    } else {
      document.getElementById("postStatus").textContent = "❌ Error posting.";
    }
  } catch (err) {
    console.error(err);
    document.getElementById("postStatus").textContent = "❌ Error uploading image.";
  }
}



let lastTypedUrl = ""
let lastTypedTime = Date.now();
let lastURLPreviewed = "";
async function previewUrl(){
    document.getElementById("postStatus").innerHTML = "";
    let url = document.getElementById("urlInput").value;

    // make sure we are looking at a new url (they might have clicked or something, but not changed the text)
    if(url != lastTypedUrl){
        
        //In order to not overwhelm the server,
        // if we recently made a request (in the last 0.5s), pause in case the user is still typing
        lastTypedUrl = url;
        let timeSinceLastType = Date.now() - lastTypedTime
        lastTypedTime = Date.now()
        if(timeSinceLastType < 500){ 
            await new Promise(r => setTimeout(r, 1000)) // wait 1 second
        }
        // if after pausing the last typed url is still our current url, then continue
        // otherwise, they were typing during our 1 second pause and we should stop trying
        // to preview this outdated url
        if(url != lastTypedUrl){
            return;
        }
        
        if(url != lastURLPreviewed) { // make sure this isn't the one we just previewd
            lastURLPreviewed = url; // mark this url as one we are previewing
            document.getElementById("url_previews").innerHTML = "Loading preview..."
            try{
                let response = await fetch(`api/${apiVersion}/urls/preview?url=` + url)
                let previewHtml = await response.text()
                if(url == lastURLPreviewed){
                    document.getElementById("url_previews").innerHTML = previewHtml;
                }
            }catch(error){
                document.getElementById("url_previews").innerHTML = "There was an error: " + error;
            }
        }
    }
}

async function likePost(postID){
    await fetchJSON(`api/${apiVersion}/posts/like`, {
        method: "POST",
        body: {postID: postID}
    })
    loadPosts();
}


async function unlikePost(postID){
    await fetchJSON(`api/${apiVersion}/posts/unlike`, {
        method: "POST",
        body: {postID: postID}
    })
    loadPosts();
}


function getCommentHTML(commentsJSON){
    return commentsJSON.map(commentInfo => {
        return `
        <div class="individual-comment-box">
            <div>${escapeHTML(commentInfo.comment)}</div>
            <div> - <a href="/userInfo.html?user=${encodeURIComponent(commentInfo.username)}">${escapeHTML(commentInfo.username)}</a>, ${escapeHTML(commentInfo.created_date)}</div>
        </div>`
    }).join(" ");
}

async function toggleComments(postID){
    let element = document.getElementById(`comments-box-${postID}`);
    if(!element.classList.contains("d-none")){
        element.classList.add("d-none");
    }else{
        element.classList.remove("d-none");
        let commentsElement = document.getElementById(`comments-${postID}`);
        if(commentsElement.innerHTML == ""){ // load comments if not yet loaded
            commentsElement.innerHTML = "loading..."

            let commentsJSON = await fetchJSON(`api/${apiVersion}/comments?postID=${postID}`)
            commentsElement.innerHTML = getCommentHTML(commentsJSON);          
        }
    }
    
}

async function refreshComments(postID){
    let commentsElement = document.getElementById(`comments-${postID}`);
    commentsElement.innerHTML = "loading..."

    let commentsJSON = await fetchJSON(`api/${apiVersion}/comments?postID=${postID}`)
    commentsElement.innerHTML = getCommentHTML(commentsJSON);
}

async function postComment(postID){

    let newComment = document.getElementById(`new-comment-${postID}`).value;

    let responseJson = await fetchJSON(`api/${apiVersion}/comments`, {
        method: "POST",
        body: {postID: postID, newComment: newComment}
    })
    if (!newComment.trim()) {
        alert("Comment cannot be empty.");
        return;
    }
    refreshComments(postID);
}