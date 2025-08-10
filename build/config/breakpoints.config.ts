export interface BreakpointConfig {
    small: string
    medium: string
    large: string
    "x-large": string
}

export type BreakpointSize = keyof BreakpointConfig

export const BREAKPOINTS: BreakpointConfig = {
    small: "460px",
    medium: "620px",
    large: "1036px",
    "x-large": "1681px",
}

export const DEFAULT_BREAKPOINT: BreakpointSize = "small"

// Helper to get breakpoint values in order
export function getBreakpointsInOrder(): Array<[BreakpointSize, string]> {
    const order: BreakpointSize[] = ["small", "medium", "large", "x-large"]
    return order.map((size) => [size, BREAKPOINTS[size]])
}
