## Maskit

Demo:
[eburlak.github.io/maskit](https://eburlak.github.io/maskit)

```
npm i --save maskit
```

```
0 - any number
A - any char
Ы - any cyrillic char
?+-()[]{}.,\\/-=_~`|'"  - autofilled chars, also you can wrap any symbol in brackets "{someChar}", and it will be autofilled
In other cases mask will be waiting for same char
```

```
<input type="text" data-maskit="+{7}(000) 000-00-00">
<input type="text" data-maskit="000 / 000">
```

```
document.querySelectorAll('input[data-maskit]').forEach((input, index) => {
  new Maskit(input, {
    mask: input.getAttribute('data-maskit'),
    resetOnBlurIfInvalid: true, // Clear field on blur if mask is not fully filled
    onFilled: ({instance}) => {}, // Triggered when mask is completely filled
    offFilled: ({instance}) => {}, // Triggered when mask is no longer completely filled
    onBlur: ({instance}) => {}, // Triggered on input blur
    onChange: ({instance}) => {}, // Triggered on every value change
    onInit: ({instance}) => {}, // Triggered after mask initialization
    beforeChange: ({instance, value}) => {}, // Called before mask is applied (for dynamic changes)
  });
});
```
