const userData = JSON.parse(localStorage.getItem("userData"));

async function fetchCategoryDueItem() {
    const userId = localStorage.getItem("userId");
    const authToken = localStorage.getItem("authToken");

    // Check if userId and token are present
    if (!userId || !authToken) {
        console.error("User ID or Auth token is missing. Redirecting to login page.");
        window.location.href = "./authentication/login-logout.html";
        return;
    }

    try {
        // Fetch categories
        const categoryResponse = await fetch(`http://localhost:5000/api/v1/user/${userId}/category`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        // Check if the response is OK
        if (!categoryResponse.ok) {
            console.error("Error fetching categories:", await categoryResponse.text());
            return;
        }

        const categories = await categoryResponse.json();
        console.log(categories);
        const DueItemList = document.getElementById('DueItemList');
        DueItemList.innerHTML = ''; // Clear previous list

        const now = new Date();
        const oneDayInMs = 24 * 60 * 60 * 1000;

        // Loop through categories and fetch items for each
        for (const category of categories) {
            const categoryId = category._id;

            const itemResponse = await fetch(`http://localhost:5000/api/v1/user/${userId}/category/${categoryId}/item`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            // Check if the response is OK
            if (!itemResponse.ok) {
                console.error(`Error fetching items for category ${category.name}:`, await itemResponse.text());
                continue;
            }

            const categoryData = await itemResponse.json();
            const items = categoryData.items || [];

            // Filter and display items due within 24 hours
            items.forEach(item => {
                const dueDate = new Date(item.serviceDate);
                const leftTime = dueDate - now;

                if (leftTime >= 0 && leftTime <= oneDayInMs && !item.workFinish) {
                    // Create item card
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'list-group-item d-flex justify-content-between align-items-center';

                    itemDiv.innerHTML = `
                        <div class="col md-4">
                            <h4 class="card-title">Name: ${item.name}</h4>
                            <p class="card-text">Description: ${item.description || 'No Description'}</p>
                            <h6 class="card-text">Due Date: ${item.serviceDate}</h6>
                        </div>`;

                    DueItemList.appendChild(itemDiv);
                }
            });
        }
    } catch (error) {
        console.error("Error fetching due items:", error);
    }
}

// Call the function on page load
fetchCategoryDueItem();
