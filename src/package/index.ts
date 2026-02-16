enum EChartType {
  PLAIN = 'plain',
  DYNAMIC = 'dynamic',
}

type TChar = {
  type: EChartType;
  value: string;
};

type TOptions = {
  mask?: string;
  onInit?: (params: { instance: Maskit }) => void;
  onFilled?: (params: { instance: Maskit }) => void;
  offFilled?: (params: { instance: Maskit }) => void;
  onChange?: (params: { instance: Maskit }) => void;
  beforeChange?: (params: { instance: Maskit; value: string }) => string | void;
  onBlur?: (params: { instance: Maskit }) => void;
  resetOnBlurIfInvalid?: boolean;
};

const SPECIAL_CHARS = '?+-()[]{}.,\\/-=_~`|\'" ';

const MASK_PATTERNS = {
  '0': /^[0-9]+$/,
  A: /^[A-Za-zА-Яа-я]+$/,
  Ы: /^[А-Яа-я]+$/,
} as const;

export default class Maskit {
  input: HTMLInputElement;
  value: string = '';
  mask: TChar[] = [];
  filled: boolean = false;
  options: TOptions;

  constructor(input: HTMLInputElement, options: TOptions = {}) {
    if (!(input instanceof HTMLInputElement)) {
      throw new Error('First argument must be DOM element');
    }

    this.options = options;

    this.input = input;
    this.value = this.input.value || '';
    this.input.value = '';

    if (options.mask) {
      this.mask = this.getMask(options.mask);
    }

    this.init();
  }

  private getMask(mask: string): TChar[] {
    const result: TChar[] = [];

    for (let i = 0; i < mask.length; i++) {
      if (mask[i] === '{' && mask[i + 2] === '}') {
        result.push({
          type: EChartType.PLAIN,
          value: mask[i + 1],
        });

        i += 2;

        continue;
      }

      if (SPECIAL_CHARS.includes(mask[i])) {
        result.push({
          type: EChartType.PLAIN,
          value: mask[i],
        });
      } else {
        result.push({
          type: EChartType.DYNAMIC,
          value: mask[i],
        });
      }
    }

    return result;
  }

  private checkMaskChar(
    char: string,
    index: number,
    maskInc: () => void,
  ): string {
    const maskChar = this.mask[index];
    let result = '';

    if (!maskChar) {
      return result;
    }

    if (maskChar.type === EChartType.PLAIN) {
      result += maskChar.value;
      result += this.checkMaskChar(char, index + 1, maskInc);
    } else if (maskChar.type === EChartType.DYNAMIC) {
      const pattern =
        MASK_PATTERNS[maskChar.value as keyof typeof MASK_PATTERNS];

      if (pattern && pattern.test(char)) {
        result += char;
      }
    }

    if (result.length) {
      maskInc();
    }

    return result;
  }

  private checkMask(value: string): string {
    if (!this.mask.length) {
      return value;
    }

    let nextValue = '';
    let maskIndex = 0;

    for (let i = 0; i < value.length; i++) {
      if (!this.mask[maskIndex]) {
        break;
      }

      const char = value[i];
      const maskChar = this.mask[maskIndex];

      if (char === maskChar.value) {
        nextValue += char;
        maskIndex++;
      } else {
        nextValue += this.checkMaskChar(char, maskIndex, () => {
          maskIndex++;
        });
      }
    }

    return nextValue;
  }

  private prepareAndSetValue(): string {
    if (!this.value) {
      return;
    }

    let nextValue = '';

    for (let i = 0; i < this.value.length; i++) {
      const maskChar = this.mask[i];
      if (!maskChar) break;

      const char = this.value[i];

      if (maskChar.type === 'plain') {
        if (maskChar.value === char) {
          nextValue += char;
        } else {
          break;
        }
      } else if (maskChar.type === 'dynamic') {
        const pattern =
          MASK_PATTERNS[maskChar.value as keyof typeof MASK_PATTERNS];
        if (pattern && pattern.test(char)) {
          nextValue += char;
        } else {
          break;
        }
      }
    }

    this.setValue(nextValue);
  }

  public setMask(mask: string): void {
    this.mask = this.getMask(mask);
    this.prepareAndSetValue();
  }

  private onFilled(): void {
    this.filled = true;
    this.options.onFilled?.({ instance: this });
  }

  private offFilled(): void {
    this.filled = false;
    this.options.offFilled?.({ instance: this });
  }

  private onBlur = (): void => {
    const { onBlur, resetOnBlurIfInvalid } = this.options;

    if (resetOnBlurIfInvalid && this.value.length !== this.mask.length) {
      this.setValue('');

      setTimeout(() => {
        if ('createEvent' in document) {
          const event = document.createEvent('HTMLEvents');
          event.initEvent('change', false, true);
          this.input.dispatchEvent(event);
        } else {
          (this.input as any).fireEvent('onchange');
        }
      }, 0);
    }

    onBlur?.({ instance: this });
  };

  setValue(value: string): void {
    if (this.value === value) {
      this.input.value = value;

      return;
    }

    this.input.value = value;
    this.value = value;

    this.options.onChange?.({ instance: this });

    if (value.length === this.mask.length) {
      this.onFilled();
    } else {
      this.offFilled();
    }
  }

  private inputListener(): void {
    this.input.addEventListener('input', (event: Event) => {
      const target = event.target as HTMLInputElement;
      let value = target.value;

      const { beforeChange } = this.options;

      if (beforeChange) {
        const nextVlaue = beforeChange({
          instance: this,
          value,
        });

        if (nextVlaue) {
          value = nextVlaue;
        }
      }

      this.setValue(this.checkMask(value));
    });
  }

  private blurListener(): void {
    this.input.addEventListener('blur', this.onBlur);
  }

  private runListeners(): void {
    this.inputListener();
    this.blurListener();
  }

  private init(): void {
    this.prepareAndSetValue();
    this.runListeners();
    this.options.onInit?.({ instance: this });
  }

  public getValue(): string {
    return this.value;
  }

  public isFilled(): boolean {
    return this.filled;
  }
}
