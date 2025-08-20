import type { FormatFnArguments } from 'style-dictionary/types';

export interface TypographyValue {
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string | number;
  letterSpacing?: string;
  lineHeight?: string | number;
  textTransform?: "none" | "capitalize" | "uppercase" | "lowercase";
  textDecoration?: string;
  fontStyle?: "normal" | "italic" | "oblique";
}


export interface SemanticRule {
  selector: string;
  properties: Record<string, string>;
  description?: string;
}

export interface SemanticMapping {
  [tokenName: string]: SemanticRule[];
}

export interface TypographyConfig {
  generateSemanticClasses?: boolean;
  semanticMapping?: SemanticMapping;
  classPrefix?: string;
  includeUtilityClasses?: boolean;
  outputComments?: boolean;
}

export interface FormatterOptions {
  typography?: TypographyConfig;
  [key: string]: unknown;
}

export interface FormatterFunction {
  (args: FormatFnArguments): string;
}

export interface Formatter {
  name: string;
  format: FormatterFunction;
}

export interface CSSRule {
  selector: string;
  declarations: Record<string, string>;
  comment?: string;
}

export interface CSSOutput {
  rules: CSSRule[];
  comments?: string[];
  imports?: string[];
}