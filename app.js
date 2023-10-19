// Insert your API key here (Google News API)!!
const apiKey = 'replacewithyourapikey';
const countryCode = "us";
const body = document.body;
let apiRequestURL;
// Initialize user data from local storage
let users = JSON.parse(localStorage.getItem('users')) || [];
let loggedInUser = null;
const newsContainer = document.querySelector(".container");
const optionsContainer = document.querySelector(".options-container");
const popupBackdrop = document.getElementById('popupBackdrop');
const popupContent = document.getElementById('popupContent');
const newsCategories = [
    "General",
    "Entertainment",
    "Health",
    "Science",
    "Sports",
    "Technology",
];





let categoryColors = {
    "General": "gray-300",
    "Entertainment": "pink-200",
    "Health": "blue-200",
    "Science": "red-200",
    "Sports": "yellow-100",
    "Technology": "purple-200",
};


// Function to show the login form 
const showLoginForm = () => {
    const loginForm = `
        <h2 class="text-xl font-semibold mb-4">Login</h2>
        <input type="text" id="loginUsername" placeholder="Username" class="w-full p-2 mb-4 border rounded">
        <input type="password" id="loginPassword" placeholder="Password" class="w-full p-2 mb-4 border rounded">
        <button type="button" onclick="login()" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Login</button>
    `;
    showPopup(loginForm);
};

// Function to hide the popup
const hidePopup = () => {
    popupBackdrop.style.display = 'none';
    popupContent.innerHTML = '';
};

// Function to show the popup
const showPopup = (content) => {
    popupBackdrop.style.display = 'flex';
    popupContent.innerHTML = content;
};

// Function to update anchor visibility based on user login status
const updateAnchorVisibility = () => {
    const anchorsLocked = document.querySelectorAll(".locked");
    const anchorsUnlocked = document.querySelectorAll(".unlocked");

    if (loggedInUser) {
        // User is logged in, show unlocked anchors and hide locked anchors
        anchorsLocked.forEach(anchor => {
            anchor.style.display = "none";
        });

        anchorsUnlocked.forEach(anchor => {
            anchor.style.display = "block";
        });
    } else {
        // User is not logged in, hide unlocked anchors and show locked anchors
        anchorsLocked.forEach(anchor => {
            anchor.style.display = "block";
        });

        anchorsUnlocked.forEach(anchor => {
            anchor.style.display = "none";
        });
    }
};


//USER REGUSTRATION AND LOGIN

// Function to show the registration form
const showRegistrationForm = () => {
    const registrationForm = `
        <h2 class="text-xl font-semibold mb-4">Register</h2>
        <input type="text" id="newUsername" placeholder="New Username" class="w-full p-2 mb-4 border rounded">
        <input type="password" id="newPassword" placeholder="New Password" class="w-full p-2 mb-4 border rounded">
        <button type="button" onclick="register()" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-500">Register</button>
    `;
    showPopup(registrationForm);
};


const register = () => {
    const newUsernameInput = document.getElementById("newUsername").value;
    const newPasswordInput = document.getElementById("newPassword").value;

    if (newUsernameInput.trim() === '' || newPasswordInput.trim() === '') {
        alert("Username and password are required.");
        return;
    }

    // Check if the username already exists
    if (users.some(user => user.username === newUsernameInput)) {
        alert("Username already exists. Please choose another.");
    } else {
        // Add the new user to the users array
        const newUser = { username: newUsernameInput, password: newPasswordInput, savedNews: [] };
        users.push(newUser);

        // Store the updated user data in local storage
        localStorage.setItem('users', JSON.stringify(users));

        alert("Registration successful. You can now log in.");
        hidePopup();
    }
};

const login = () => {
    const usernameInput = document.getElementById("loginUsername").value;
    const passwordInput = document.getElementById("loginPassword").value;

    if (usernameInput.trim() === '' || passwordInput.trim() === '') {
        alert("Username and password are required.");
        return;
    }

    const user = users.find(u => u.username === usernameInput && u.password === passwordInput);
    if (user) {
        loggedInUser = user;
        console.log("Logged in:", loggedInUser);

        updateAnchorVisibility();

        const buttons = document.querySelector("#userbuttons");
        buttons.style.display = "none";
        const header = document.querySelector("header");
        const heading = document.querySelector("h1");
        heading.style.color = "white";
        header.style.background = "#272727";
        hidePopup();
    } else {
        alert("Invalid username or password");
    }
};


// Function to check if a user is logged in
const isUserLoggedIn = () => {
    return loggedInUser !== null;
};

const formatNewsDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toDateString(undefined, options);

};

const truncateNewsText = (text, maxChars) => {
    return text.length > maxChars ? text.slice(0, maxChars) + '...' : text;
};

const cleanUpTitle = (title) => {
    const wordCount = title.split(/\s+/).length;

    // If there is a colon and the word count is more than 14, remove everything after the second comma and the second comma
    if (title.includes(':') && wordCount > 14) {
        const commas = title.match(/,/g);
        if (commas && commas.length >= 2) {
            const secondCommaIndex = title.indexOf(',', title.indexOf(',') + 1);
            title = title.slice(0, secondCommaIndex).trim();
        }
    }

    else if (wordCount > 10) {
        const commas = title.match(/,/g);
        if (commas && commas.length >= 2) {
            const lastCommaIndex = title.lastIndexOf(',');
            title = title.slice(0, lastCommaIndex).trim();
        }
    }

    title = title.replace(/-\s*[^\-]*$/, '').trim();
    const words = title.split(/\s+/);
    if (words.length > 14) {
        title = words.slice(0, 12).join(' ') + '...';
    }
    return title.trim();
};



const displayNewsUI = (articles) => {
    // Filter out articles containing "[Removed]"
    const filteredArticles = articles.filter(item => !item.title.includes("[Removed]"));

    filteredArticles.forEach((item) => {
        const newsCard = document.createElement("div");
        // Extract category from the API request URL
        const categoryMatch = apiRequestURL.match(/category=(\w+)/);
        const category = categoryMatch ? categoryMatch[1].toLowerCase() : 'general';

        // Use category color or default to gray
        const categoryColor = categoryColors[category] || "gray";

        newsCard.classList.add(
            "news-card", "border", `border-${categoryColor}-300`, "bg-stone-200", "shadow-md", "rounded-xl", "h-1000", "relative"
        );

        const contentWrapper = document.createElement("div");
        contentWrapper.classList.add(
            "p-0", "h-full", "z-0", "relative", "flex", "flex-col", "justify-between"
        );

        const formattedDate = formatNewsDate(item.publishedAt);
        const truncatedDescription = truncateNewsText(item.description || item.content || "", 100);
        const cleanedTitle = cleanUpTitle(item.title);

        contentWrapper.innerHTML = `
        <div class="news-image-container relative h-48 z-0">
            <img src="${item.urlToImage || './default-image.jpg'}" alt="" class="w-full h-full object-cover rounded-xl">
            <div class="absolute bottom-0 left-0 bg-stone-200 text-gray px-2 py-1 flex gap-4 items-center w-full">
                <div class="news-source-tag relative bg-stone-200 text-gray">${item.source.name}</div>
                <div class="text-neutral-900">${formattedDate}</div>
            </div> 
        </div>
        <div class="news-content p-5 h-full flex flex-col justify-between">
            <div class="news-title font-bold text-xl">${cleanedTitle}</div>
            <div class="news-description mt-2 h-full">${truncatedDescription}</div>
            <a href="#" style="display: block;" class="locked text-red-500 font-bold cursor-default">Log in to access this</a>
            <a href="${item.url}" target="_blank" class="unlocked view-button mt-4 inline-block px-4 py-2 bg-neutral-800 text-white rounded text-center hover-bg-green-600 w-max" style="display: none;">Read More</a>
        </div>`;

        newsCard.appendChild(contentWrapper);
        newsContainer.appendChild(newsCard);
        updateAnchorVisibility();
    });
};


const fetchNewsData = async () => {
    newsContainer.innerHTML = "";
    try {
        const response = await fetch(apiRequestURL);
        if (!response.ok) {
            throw new Error("News data is unavailable at the moment.");
        }
        const data = await response.json();
        displayNewsUI(data.articles);
    } catch (error) {
        alert(error.message);
    }
};





const createNewsOptions = () => {
    newsCategories.forEach((category) => {
        const categoryColor = categoryColors[category] || "gray";
        const textColor = "black"; // Change 'blue' to the default text color

        optionsContainer.innerHTML += `<button class="option ${category === "general" ? "active" : ""
            } bg-${categoryColor} text-${textColor} px-4 py-2 rounded m-2" onclick="selectNewsCategory(event,'${category}')">${category}</button>`;
    });
};
const selectNewsCategory = (e, category) => {
    // Remove the active class from all options
    document.querySelectorAll(".option").forEach((element) => {
        element.classList.remove("active");
    });

    // Add the active class to the clicked option
    e.target.classList.add("active");


    // Update the API request URL and fetch news data
    apiRequestURL = `https://newsapi.org/v2/top-headlines?country=${countryCode}&category=${category}&apiKey=${apiKey}`;
    fetchNewsData();

};

const initializeNewsApp = () => {
    optionsContainer.innerHTML = "";
    fetchNewsData();
    createNewsOptions();

};

window.onload = () => {
    apiRequestURL = `https://newsapi.org/v2/top-headlines?country=${countryCode}&category=general&apiKey=${apiKey}`;
    initializeNewsApp();
}; 