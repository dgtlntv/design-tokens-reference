import type { 
  Config as StyleDictionaryConfig, 
  PlatformConfig as StyleDictionaryPlatformConfig,
  TransformedToken,
  FormatFnArguments
} from "style-dictionary/types";

export interface TokenPath {
  source?: string | string[];
  include?: string | string[];
  reference?: string | string[];
}

export interface TokenPaths {
  [key: string]: TokenPath | TokenPaths;
}

export interface PlatformOverride {
  format?: string;
  filter?: (token: TransformedToken) => boolean;
}

export interface ExtendedPlatformConfig extends StyleDictionaryPlatformConfig {
  formatters?: unknown[];
  fileExtension: string;
  defaultFormat: string;
  categoryOverrides?: {
    [category: string]: PlatformOverride;
  };
}

export interface ExtendedConfig extends StyleDictionaryConfig {
  platforms: {
    [platform: string]: ExtendedPlatformConfig;
  };
}

export type ConfigTier = "sites" | "docs" | "apps";

export interface TierConfig {
  tier: ConfigTier;
  config: StyleDictionaryConfig;
}

export type { StyleDictionaryConfig, StyleDictionaryPlatformConfig, TransformedToken, FormatFnArguments };