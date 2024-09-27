document.addEventListener('DOMContentLoaded', function () {
  const categoryMessageElement = document.getElementById("categoryMessage");
  const itemMessageElement = document.getElementById("itemMessage");
  

  // Add category form submit
  document.getElementById("CategoryForm").addEventListener("submit", async function (e) {
      e.preventDefault(); // Prevent default form submission

      const CategoryName = document.getElementById("CategoryName").value.trim(); // Trim whitespace
      if (!CategoryName) {
          categoryMessageElement.innerText = "Please enter a category name.";
          return;
      }

      const requestBody = { name: CategoryName };

      try {
          const response = await fetch("http://localhost:5000/api/v1/admin/categories", {
              method: "POST",
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(requestBody)
          });

          const result = await response.json();
          console.log(result); // Log the result for debugging

          if (response.ok) {
              // Create and append the new category to the list
              const newCategory = document.createElement('li');
              newCategory.id = result._id; // Assuming result returns the created category with its id
              newCategory.innerText = result.name;
              newCategory.className = 'list-group-item d-flex justify-content-between align-items-center';

              // Create the delete button
              const deleteButton = document.createElement('button');
              deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>'; // Using Font Awesome for the trash icon
              deleteButton.className = 'btn btn-danger btn-sm'; // Bootstrap classes for styling
              deleteButton.style.marginLeft = 'auto'; // Push the button to the right
              deleteButton.onclick = () => {
                  deleteCategorybyID(result._id);
              };

              // Append the delete button and new category to the list
              newCategory.appendChild(deleteButton);
              document.getElementById('CategoryList').appendChild(newCategory);

              // Show success message
              categoryMessageElement.innerText = "Category created successfully!";
              document.getElementById("CategoryForm").reset(); // Reset form fields
              const modal = bootstrap.Modal.getInstance(document.getElementById('exampleModal'));
              if (modal) modal.hide(); // Hide modal if it exists

              // Clear the message after 3 seconds
              setTimeout(() => { categoryMessageElement.innerText = ''; }, 3000);
              fetchCategories(); // Refresh the categories
          } else {
              categoryMessageElement.innerText = result.message || "Failed to create category.";
          }
      } catch (error) {
          categoryMessageElement.innerText = "Error occurred: " + error.message;
      }
  });

  // Fetch and display categories
  async function fetchCategories() {
      try {
          const response = await fetch('http://localhost:5000/api/v1/categories');
          const Categories = await response.json();
          const CategoryList = document.getElementById('CategoryList');
          const categoryDropdown = document.getElementById('CategoryId');

          // Clear the list and dropdown
          CategoryList.innerHTML = '';
          categoryDropdown.innerHTML = '<option value="" disabled selected>Select Category</option>';

          Categories.forEach(Category => {
              const li = document.createElement('li');
              li.id = Category._id;
              li.innerText = Category.name;
              li.className = 'list-group-item d-flex justify-content-between align-items-center';

              // Create the delete button with an icon
              const deleteButton = document.createElement('button');
              deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>'; // Using Font Awesome for the trash icon
              deleteButton.className = 'btn btn-danger btn-sm'; // Bootstrap classes for styling
              deleteButton.style.marginLeft = 'auto'; // Push the button to the right
              deleteButton.onclick = () => {
                  deleteCategorybyID(Category._id);
              };

              // Append the delete button to the list item
              li.appendChild(deleteButton);
              CategoryList.appendChild(li);

              // Populate the dropdown with categories for adding items
              const option = document.createElement('option');
              option.value = Category._id;
              option.innerText = Category.name;
              categoryDropdown.appendChild(option);
          });
      } catch (error) {
          categoryMessageElement.innerText = "Error occurred: " + error.message;
      }
  }

  // Load categories on page load
  fetchCategories();

  // Delete category by ID
  async function deleteCategorybyID(id) {
      if (!confirm("Are you sure you want to delete this category?")) {
          return; // User cancelled the action
      }

      try {
          const response = await fetch(`http://localhost:5000/api/v1/categories/${id}`, {
              method: "DELETE"
          });

          const result = await response.json();
          if (response.ok) {
              // Remove the category from the list immediately
              const categoryItem = document.getElementById(id);
              if (categoryItem) {
                  categoryItem.remove(); // Remove the item from the DOM
              }
              categoryMessageElement.innerText = "Category deleted successfully!";
              // Clear the message after 3 seconds
              setTimeout(() => { categoryMessageElement.innerText = ''; }, 3000);
          } else {
              categoryMessageElement.innerText = result.message || "Failed to delete category.";
          }
      } catch (error) {
          categoryMessageElement.innerText = "Error occurred: " + error.message;
      }
  }

  
 // Add item form submit
 document.getElementById("ItemForm").addEventListener("submit", async function (e) {
    e.preventDefault(); // Prevent default form submission

    const CategoryId = document.getElementById("CategoryId").value;
    const ItemName = document.getElementById("ItemName").value.trim(); // Trim whitespace
    const ItemDescription = document.getElementById("ItemDescription").value.trim();

    if (!CategoryId || !ItemName) {
        itemMessageElement.innerText = "Please select a category and enter an item name.";
        return;
    }

    // Check for existing items before adding
    // const existingItems = await fetchExistingItemsForCategory(CategoryId);
    // const itemExists = existingItems.some(item => item.name.toLowerCase() === ItemName.toLowerCase());

    // if (itemExists) {
    //     const alertElement = document.getElementById("itemMessage");
    //     alertElement.innerText = "Item already exists. Please add a valid description to differentiate.";
    //     alertElement.style.display = "block"; // Show the alert
    
    //     // Optionally, hide the alert after 3 seconds
    //     setTimeout(() => {
    //         alertElement.style.display = "none"; // Hide the alert
    //     }, 3000);
    // }
    
    const requestBody = {
        name: ItemName,
        description: ItemDescription,
        categoryId: CategoryId
    };

    try {
        const response = await fetch(`http://localhost:5000/api/v1/categories/${CategoryId}/items`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        const result = await response.json();

        if (response.ok) {
            fetchItemsForCategory(CategoryId); // Refresh items list
            itemMessageElement.innerText = "Item added successfully!";
            document.getElementById("ItemForm").reset();
            setTimeout(() => { itemMessageElement.innerText = ''; }, 3000);
        } else {
            itemMessageElement.innerText = result.message || "Error adding item.";
        }
    } catch (error) {
        itemMessageElement.innerText = "Error adding item.";
        console.error(error);
    }
});

// // Fetch existing items for a selected category
// async function fetchExistingItemsForCategory(categoryId) {
//     try {
//         const response = await fetch(`http://localhost:5000/api/v1/categories/${categoryId}/items`);
//         return await response.json();
//     } catch (error) {
//         console.error('Error fetching existing items:', error);
//         return [];
//     }
// }

// Fetch items for a selected category
document.getElementById("CategoryId").addEventListener("change", function () {
    const categoryId = this.value;
    fetchItemsForCategory(categoryId);
});

async function fetchItemsForCategory(categoryId) {
    try {
        const response = await fetch(`http://localhost:5000/api/v1/categories/${categoryId}/items`);
        const items = await response.json();
        const itemList = document.getElementById("ItemList");
        itemList.innerHTML = "";

        items.forEach(item => {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
            listItem.innerText = item.name + (item.description ? `: ${item.description}` : '');

            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
            deleteButton.className = 'btn btn-danger btn-sm';
            deleteButton.onclick = () => deleteItemByID(item._id, categoryId);

            listItem.appendChild(deleteButton);
            itemList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error fetching items:', error);
    }
}

async function deleteItemByID(itemId, categoryId) {
    try {
        const response = await fetch(`http://localhost:5000/api/v1/categories/${categoryId}/item/${itemId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            fetchItemsForCategory(categoryId); // Refresh items list after deletion
        } else {
            console.error('Failed to delete item');
        }
    } catch (error) {
        console.error('Error deleting item:', error);
    }
}
});

