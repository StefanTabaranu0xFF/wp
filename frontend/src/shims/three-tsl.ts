// Minimal stubs for the three.js TSL helpers used by three-globe when WebGPU support is available.
// The application relies on the CPU fallback path, so these functions provide no-op implementations
// that satisfy the module resolver without shipping full WebGPU support.

type ScalarNode = {
  mul: (...args: any[]) => ScalarNode;
  div: (...args: any[]) => ScalarNode;
  add: (...args: any[]) => ScalarNode;
  sub: (...args: any[]) => ScalarNode;
  addAssign: (...args: any[]) => void;
  assign: (...args: any[]) => void;
  lessThan: (...args: any[]) => boolean;
  xy: { x: ScalarNode; y: ScalarNode };
  z?: ScalarNode;
};

const createScalar = (): ScalarNode => {
  const stub = {} as ScalarNode;
  stub.mul = () => stub;
  stub.div = () => stub;
  stub.add = () => stub;
  stub.sub = () => stub;
  stub.addAssign = () => {};
  stub.assign = () => {};
  stub.lessThan = () => false;
  stub.xy = { x: stub, y: stub };
  stub.z = stub;
  return stub;
};

export const storage = (..._args: any[]) => ({
  element: () => ({
    assign: () => {},
    addAssign: () => {},
    xy: { x: createScalar(), y: createScalar() },
    z: createScalar()
  })
});

export const uniform = (value: any) => ({
  value,
  mul: () => createScalar(),
  div: () => createScalar(),
  sub: () => createScalar()
});

export const Fn = (..._args: any[]) => () => ({
  compute: (_count?: number) => ({})
});

export const Loop = (count: any, iterate: (...args: any[]) => void) => {
  if (typeof count === 'number') {
    for (let i = 0; i < count; i += 1) {
      iterate({ i });
    }
  }
};

export const If = (condition: any, truthy: () => void) => {
  if (condition) {
    truthy();
  }
};

export const instanceIndex = createScalar();

const wrapMath = () => createScalar();

export const sqrt = wrapMath;
export const sin = wrapMath;
export const cos = wrapMath;
export const asin = wrapMath;
export const exp = wrapMath;
export const negate = () => createScalar();
export const float = (_value: any) => createScalar();

export default {
  storage,
  uniform,
  Fn,
  Loop,
  If,
  instanceIndex,
  sqrt,
  sin,
  cos,
  asin,
  exp,
  negate,
  float
};
