import Maskit from '../package';
import './styles.css';

declare const hljs: any;

window.addEventListener('load', () => {
  const reRenderCode = (mask) => {
    document.querySelectorAll('.mask-value').forEach((item) => {
      item.innerHTML = mask;
      setTimeout(() => {
        hljs.highlightBlock(item.closest('.code'));
      }, 0);
    });
  };
  const maskInput = document.querySelector<HTMLInputElement>('input#mask');
  const mask = maskInput.value;
  const resultInput = document.querySelector<HTMLInputElement>('input#result');

  const maskit = new Maskit(resultInput, {
    mask,
    resetOnBlurIfInvalid: true,
    onFilled: ({ instance }) => {},
    offFilled: ({ instance }) => {},
    onBlur: ({ instance }) => {},
    beforeChange: ({ instance, value }) => {},
    onChange: ({ instance }) => {},
    onInit: ({ instance }) => {
      console.log(instance);
      reRenderCode(instance.options.mask);
    },
  });

  document.querySelectorAll('.mask-value').forEach((item) => {
    item.innerHTML = mask;
  });

  maskInput.addEventListener('input', (event) => {
    const { value } = event.target as HTMLInputElement;

    maskit.setValue('');
    maskit.setMask(value);

    reRenderCode(value);
  });
});
