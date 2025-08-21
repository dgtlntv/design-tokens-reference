export type ColorSpace = 
  | "srgb" 
  | "srgb-linear"
  | "oklch" 
  | "oklab"
  | "lab" 
  | "lch" 
  | "display-p3" 
  | "a98-rgb"
  | "prophoto-rgb"
  | "rec2020" 
  | "xyz-d50" 
  | "xyz-d65"
  | "hsl"
  | "hwb";

export interface ColorValue {
  colorSpace: ColorSpace;
  components: (number | string)[];
  alpha?: number;
}

export interface DimensionValue {
  value: number;
  unit: string;
}

export interface TokenReference {
  $type: string;
  $value: string;
  $description?: string;
}

export interface BaseToken {
  $type: string;
  $value: unknown;
  $description?: string;
}

export interface ColorToken extends BaseToken {
  $type: "color";
  $value: string | ColorValue;
}

export interface DimensionToken extends BaseToken {
  $type: "dimension";
  $value: string | DimensionValue;
}

export interface TypographyToken extends BaseToken {
  $type: "typography";
  $value: {
    fontFamily?: string | TokenReference;
    fontSize?: string | TokenReference;
    fontWeight?: string | number | TokenReference;
    letterSpacing?: string | TokenReference;
    lineHeight?: string | number | TokenReference;
    textTransform?: "none" | "capitalize" | "uppercase" | "lowercase" | TokenReference;
    textDecoration?: string | TokenReference;
    fontStyle?: "normal" | "italic" | "oblique" | TokenReference;
  };
}

export type TokenValue = ColorValue | DimensionValue | string | number | Record<string, unknown>;

export interface Token {
  $type?: string;
  $value?: TokenValue;
  $description?: string;
  [key: string]: unknown;
}

export interface TokenGroup {
  [key: string]: Token | TokenGroup;
}