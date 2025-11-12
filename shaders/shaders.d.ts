// shaders.d.ts
// TypeScript module declarations for vite-plugin-glsl shader imports

declare module '*.vert.glsl' {
  const content: string;
  export default content;
}

declare module '*.frag.glsl' {
  const content: string;
  export default content;
}

declare module '*.glsl' {
  const content: string;
  export default content;
}
