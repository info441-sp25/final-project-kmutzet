async function init() {
    await loadIdentity();
    loadUserInfo();

    const toggle = document.getElementById("postsToggle");
    const likedPostsBox = document.getElementById("liked_posts_box");
    const postsBox = document.getElementById("posts_box");

    function updateView() {
        if (toggle.checked) {
            likedPostsBox.style.display = "block";
            postsBox.style.display = "none";
        } else {
            likedPostsBox.style.display = "none";
            postsBox.style.display = "block";
        }
    }

    toggle.addEventListener("change", updateView);

    // Add label click handlers to toggle the switch
    document.getElementById("label-left").onclick = () => {
        toggle.checked = true;
        toggle.dispatchEvent(new Event("change"));
    };

    document.getElementById("label-right").onclick = () => {
        toggle.checked = false;
        toggle.dispatchEvent(new Event("change"));
    };

    updateView(); // initialize on load
}


async function saveUserInfo(){
    //TODO: do an ajax call to save whatever info you want about the user from the user table
    //see postComment() in the index.js file as an example of how to do this
    const profileBio = document.getElementById("profile-bio").value;
    let responseJson = await fetchJSON(`api/${apiVersion}/userinfo`, {
        method: "POST",
        body: {username: myIdentity, profileBio: profileBio}
    })
    loadUserInfo();
}


async function loadUserInfo(){
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('user');
    if(username==myIdentity){
        document.getElementById("username-span").innerText= `You (${username})`;
        document.getElementById("user_info_new_div").classList.remove("d-none");
        
    }else{
        document.getElementById("username-span").innerText=username;
        document.getElementById("user_info_new_div").classList.add("d-none");
    }
    
    //TODO: do an ajax call to load whatever info you want about the user from the user table

    let userInfoJson = await fetchJSON(`api/${apiVersion}/userinfo?username=${encodeURIComponent(username)}`);
    document.getElementById('profile-bio-display').innerText = userInfoJson.profileBio;
    if (username == myIdentity) {
        document.getElementById('profile-bio').value = userInfoJson.profileBio|| '';
    }
    
    loadUserInfoPosts(username)
    loadLikedPosts(username);

}


async function loadUserInfoPosts(username){
    document.getElementById("posts_box").innerText = "Loading...";
    let postsJson = await fetchJSON(`api/${apiVersion}/posts?username=${encodeURIComponent(username)}`);
    let postsHtml = postsJson.map(postInfo => {
        const imageHTML = postInfo.imageURLs?.map(url => 
            `<img src="${escapeHTML(url)}" alt="post image" class="img-fluid mb-2">`
        ).join("") || "";

        return `
        <div class="post mb-4">
            <div class="card-body">
            <div class="image-container d-flex justify-content-center mb-2">
                ${imageHTML}
            </div>
            <!-- THIS line must have the id with postID -->
            <p id="post-desc-${postInfo.id}">${escapeHTML(postInfo.description)}</p>
            <div>
                <a href="/userInfo.html?user=${encodeURIComponent(postInfo.username)}">${escapeHTML(postInfo.username)}</a>, ${escapeHTML(postInfo.created_date)}
            </div>
            <div class="post-interactions mt-2">
                <span title="${postInfo.likes ? escapeHTML(postInfo.likes.join(", ")) : ""}">
                ${postInfo.likes ? postInfo.likes.length : 0} likes
                </span>
                <button onclick='editPost("${postInfo.id}")' class="${postInfo.username == myIdentity ? "" : "d-none"} ms-2 btn btn-sm btn-orange">Edit</button>
                <button onclick='deletePost("${postInfo.id}")' class="${postInfo.username == myIdentity ? "" : "d-none"} ms-2 btn btn-red">Delete</button>
            </div>
            </div>
        </div>`;
    }).join("\n");
    document.getElementById("posts_box").innerHTML = `<div class="posts-container">${postsHtml}</div>`;
}

async function loadLikedPosts(username) {
    // only if viewing your own profile
    if (username !== myIdentity) return;

    document.getElementById("liked_posts_box").innerText = "Loading liked posts...";
    const likedPosts = await fetchJSON(`api/${apiVersion}/posts?likedBy=${encodeURIComponent(username)}`);

    if (!likedPosts.length) {
        document.getElementById("liked_posts_box").innerText = "You haven’t liked any posts yet.";
        return;
    }

    const postsHtml = likedPosts.map(postInfo => {
        const imageHTML = postInfo.imageURLs?.map(url => 
            `<img src="${escapeHTML(url)}" alt="post image" class="img-fluid mb-2">`
        ).join("") || "";

        return `
        <div class="post mb-4">
            <div class="card-body">
                <div class="image-container d-flex justify-content-center mb-2">
                ${imageHTML}
                </div>
                <p>${escapeHTML(postInfo.description)}</p>
                <div>
                <a href="/userInfo.html?user=${encodeURIComponent(postInfo.username)}">${escapeHTML(postInfo.username)}</a>, ${escapeHTML(postInfo.created_date)}
                </div>
                <div class="post-interactions mt-2">
                <span title="${postInfo.likes ? escapeHTML(postInfo.likes.join(", ")) : ""}">
                    ${postInfo.likes ? postInfo.likes.length : 0} likes
                </span>
                </div>
            </div>
        </div>`;
    }).join("\n");

    document.getElementById("liked_posts_box").innerHTML = `<div class="posts-container">${postsHtml}</div>`;
}

async function editPost(postID) {
console.log('Looking for:', `post-desc-${postID}`);
  const descP = document.getElementById(`post-desc-${postID}`);
  const currentDesc = descP.innerText;

  // Replace the paragraph with a textarea + save button for simplicity
  descP.innerHTML = `
    <textarea id="edit-textarea-${postID}" class="form-control mb-2">${escapeHTML(currentDesc)}</textarea>
    <button class="btn btn-sm btn-primary" onclick="savePostEdit('${postID}')">Save</button>
    <button class="btn btn-sm btn-secondary ms-2" onclick="cancelPostEdit('${postID}', '${escapeHTML(currentDesc)}')">Cancel</button>
  `;
}

async function savePostEdit(postID) {
  const newText = document.getElementById(`edit-textarea-${postID}`).value;

  let responseJson = await fetchJSON(`api/${apiVersion}/posts`, {
    method: "PUT",  // assuming your API supports PUT for editing
    body: { postID: postID, description: newText }
  });

  // Reload posts or update the UI accordingly
  loadUserInfo();
}

function cancelPostEdit(postID, originalText) {
    console.log('Looking for:', `post-desc-${postID}`);
  const descP = document.getElementById(`post-desc-${postID}`);
  descP.innerText = originalText;
}



async function deletePost(postID){
    let responseJson = await fetchJSON(`api/${apiVersion}/posts`, {
        method: "DELETE",
        body: {postID: postID}
    })
    loadUserInfo();
}