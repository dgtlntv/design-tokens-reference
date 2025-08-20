import type {
    AttributeTransform,
    NameTransform,
    Transform,
    ValueTransform,
} from "style-dictionary/types"

export interface ColorTransformOptions {
    outputColorSpace?: string
    precision?: number
}

export interface DimensionTransformOptions {
    outputUnit?: string
    precision?: number
    baseFontSize?: number
}

export interface TransformResult<T = unknown> {
    value: T
    originalValue?: unknown
}

export interface ColorTransformResult extends TransformResult<string> {
    colorSpace?: string
    components?: (number | string)[]
}

export interface DimensionTransformResult extends TransformResult<string> {
    numericValue?: number
    unit?: string
}

export type { AttributeTransform, NameTransform, Transform, ValueTransform }
