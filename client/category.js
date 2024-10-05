// Fetch category items when the page loads
document.addEventListener('DOMContentLoaded', function () {
    const params = new URLSearchParams(window.location.search);
    const categoryId = params.get('categoryId');

    if (!categoryId) {
        document.getElementById("categoryContainer").innerText = "No category ID found in the URL.";
        return; // Stop further execution if no category ID is found
    }

    // Fetch and display items for the category
    fetchCategoryItems(categoryId);

    // Handle item form submission
    document.getElementById('ItemForm').addEventListener('submit', function (event) {
        event.preventDefault();
        addItemToCategory(categoryId); // Use the fetched categoryId from URL
    });

    // Toggle item form visibility when plus button is clicked
    const showFormButton = document.getElementById('showFormButton');
    const itemFormContainer = document.getElementById('itemFormContainer');
    const cancelButton = document.getElementById('cancelButton');

    showFormButton.addEventListener('click', function () {
        itemFormContainer.style.display = 'block'; // Show the form
    });

    cancelButton.addEventListener('click', function () {
        itemFormContainer.style.display = 'none'; // Hide the form
    });
});

// Function to fetch and display category items
async function fetchCategoryItems(categoryId) {
    try {
        const response = await fetch(`http://localhost:5000/api/v1/categories/${categoryId}/items`);
        const data = await response.json();

        if (!data || !data.getting) {
            document.getElementById("categoryContainer").innerText = "No such category found.";
            return;
        }

        const items = data.getting.items;
        const categoryContainer = document.getElementById('categoryContainer');
        categoryContainer.innerHTML = ''; // Clear previous content

        if (items.length === 0) {
            categoryContainer.innerText = "No items found in this category.";
            return;
        }

        const card = document.createElement('div');
        card.classList.add('card');

        const cardHeader = document.createElement('div');
        cardHeader.classList.add('card-header');
        cardHeader.textContent = data.getting.name; // Category name
        card.appendChild(cardHeader);

        const listGroup = document.createElement('ul');
        listGroup.classList.add('list-group', 'list-group-flush');

        items.forEach(item => {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item d-flex justify-content-between align-items-center';

            // Create a checkbox
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = item.workFinish; // Set checkbox based on item's finish status
            checkbox.addEventListener('change', async function () {
                if (this.checked) { // If checked
                    const isConfirmed = confirm("Have you completed this task?");
                    if (isConfirmed) {
                        await toggleCheckBox(categoryId, item._id);
                    } else {
                        checkbox.checked = false; // Revert checkbox state if canceled
                    }
                } else { // If unchecked
                    const isConfirmed = confirm("Are you sure you want to uncheck this checkbox?");
                    if (isConfirmed) {
                        await toggleCheckBox(categoryId, item._id);
                    } else {
                        checkbox.checked = true; // Revert checkbox state if canceled
                    }
                }
            });
            
            // Create the delete button
            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>'; // Font Awesome trash icon
            deleteButton.className = 'btn btn-danger btn-sm'; // Bootstrap styling
            deleteButton.onclick = (e) => {
                e.stopPropagation(); // Prevent event propagation
                deleteItemFromCategory(categoryId, item._id);
            };

            listItem.textContent = `${item.name}: ${item.description || 'No description available'}`;
            listItem.prepend(checkbox); // Add checkbox before text
            listItem.appendChild(deleteButton); // Add delete button at the end
            listGroup.appendChild(listItem);
        });

        card.appendChild(listGroup);
        categoryContainer.appendChild(card);
    } catch (error) {
        document.getElementById("categoryContainer").innerText = `Error fetching category items: ${error.message}`;
    }
}

// Function to add an item to the category
async function addItemToCategory(categoryId) {
    const itemNameInput = document.getElementById('ItemName');
    const itemDescriptionInput = document.getElementById('ItemDescription');
    const itemInstructionInput = document.getElementById('ItemInstruction');
    const responseMessage = document.getElementById('ResponseMessage');
    const itemFormContainer = document.getElementById('itemFormContainer'); // To hide the form later


    // Check if the input elements exist
    if (!itemNameInput || !itemDescriptionInput || !itemInstructionInput) {
        responseMessage.innerText = "Input fields are not found. Please check your HTML.";
        return;
    }

    const itemName = itemNameInput.value;
    const itemDescription = itemDescriptionInput.value;
    const itemInstruction = itemInstructionInput.value;
    console.log(itemInstruction);

    if (!itemName) {
        responseMessage.innerText = "Please enter an Item Name to add to the category";
        return;
    }

    const requiredData = { name: itemName,
         description: itemDescription,
          instructions: itemInstruction, 
        };

    try {
        const response = await fetch(`http://localhost:5000/api/v1/categories/${categoryId}/items`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requiredData)
        });

        if (response.ok) {
            responseMessage.innerText = "Item Added Successfully!";

            // Clear input fields after successful addition
            itemNameInput.value = '';
            itemDescriptionInput.value = '';
            itemInstructionInput.value = '';

            // Hide the form immediately
            itemFormContainer.style.display = 'none';

            // Hide the message after 3 seconds
            setTimeout(() => {
                responseMessage.innerText = '';
            }, 3000);

            // Optionally, you can refresh the list after adding a new item
            fetchCategoryItems(categoryId);
        } else {
            const errorData = await response.json();
            responseMessage.innerText = `Error: ${errorData.message}`;
        }
    } catch (error) {
        console.error("Error Adding Item:", error);
        responseMessage.innerText = `Item Not Added: ${error.message}`;
    }
    console.log("Request Body: ", JSON.stringify(requiredData)); // Log the request body
}

// Function to toggle item checkbox (update item status)
async function toggleCheckBox(categoryId, itemId) {
    try {
        const response = await fetch(`http://localhost:5000/api/v1/categories/${categoryId}/items/${itemId}`, {
            method: 'PUT'
        });
        if (!response.ok) {
            throw new Error("Cannot update the item status!");
        }
    } catch (error) {
        console.error(`Error updating item status: ${error.message}`);
    }
}

// Function to delete item from category
async function deleteItemFromCategory(categoryId, itemId) {
    if (!confirm("Are you sure you want to delete this item?")) {
        return; // Exit the function if the user cancels
    }
    try {
        const response = await fetch(`http://localhost:5000/api/v1/categories/${categoryId}/item/${itemId}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error("Cannot delete the item!");
        }

        // Fetch and update category items after successful deletion
        fetchCategoryItems(categoryId);
    } catch (error) {
        console.error(`Error deleting item: ${error.message}`);
    }
}
