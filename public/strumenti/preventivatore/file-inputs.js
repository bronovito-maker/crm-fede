(() => {
  'use strict';

  document.querySelectorAll('.drop').forEach((card) => {
    const picker = card.querySelector('.picker');
    const choose = card.querySelector('.choose');
    if (!picker || !choose) return;

    choose.onclick = (event) => {
      event.preventDefault();
      picker.click();
    };

    card.addEventListener('dragenter', (event) => {
      event.preventDefault();
      event.stopPropagation();
      card.classList.add('drag');
    });
    card.addEventListener('dragover', (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.dataTransfer.dropEffect = 'copy';
      card.classList.add('drag');
    });
    card.addEventListener('dragleave', (event) => {
      if (!card.contains(event.relatedTarget)) card.classList.remove('drag');
    });
    card.addEventListener('drop', (event) => {
      event.preventDefault();
      event.stopPropagation();
      card.classList.remove('drag');
      const files = event.dataTransfer?.files;
      if (!files?.length) return;
      const transfer = new window.DataTransfer();
      transfer.items.add(files[0]);
      picker.files = transfer.files;
      picker.dispatchEvent(new window.Event('change', { bubbles: true }));
    });
  });
})();
