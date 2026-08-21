(() => {
  'use strict';

  document.querySelectorAll('.drop').forEach((card) => {
    const picker = card.querySelector('.picker');
    const choose = card.querySelector('.choose');
    if (!picker || !choose) return;

    choose.onclick = (event) => {
      event.preventDefault();
      if (typeof picker.showPicker === 'function') {
        try {
          picker.showPicker();
          return;
        } catch {
          // Alcuni browser rifiutano showPicker in contesti embedded: fallback al click standard.
        }
      }
      picker.click();
    };

    picker.addEventListener('change', () => {
      const file = picker.files?.[0];
      if (!file) return;
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      if (!isPdf) return;
      card.classList.add('ready');
      const icon = card.querySelector('.fileIcon');
      const filename = card.querySelector('.filename');
      const button = card.querySelector('.choose');
      if (icon) icon.textContent = '✓';
      if (filename) filename.textContent = file.name;
      if (button) button.textContent = 'Sostituisci PDF';
    });

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
