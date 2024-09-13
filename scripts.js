const listItems = document.querySelectorAll('.list-group-item');

listItems.forEach(listItem => {
  listItem.addEventListener('click', () => {
    const itemId = listItem.getAttribute('data-item-id');
    openItemPage(itemId);
  });
});

function openItemPage(itemId) {
  window.location.href = 'items/item1.html?id=' + itemId;
}