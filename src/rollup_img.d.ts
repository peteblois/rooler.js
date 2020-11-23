declare module '*.png' {
    const value: any;
    export default value;
}

declare module '*.css' {
    const value: any;
    export default value;
    export const stylesheet: string;
}
