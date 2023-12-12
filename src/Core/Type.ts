// Type for Object
export type TObject<Type = any> = { [sKey: string]: Type };

// Type for Listener Collection
export type TListeners = TObject<Function>;
export type TListenersList = TObject<Function[]>;

// Type for String 
export type TData = TObject<string>;
export type TEmptyData = TObject<string | null>;
export type TDataList = TObject<string[]>;

// Type for Flag
export type TFlag = TObject<boolean>;
export type TFlagList = TObject<boolean[]>;

// Type for Value
export type TValue = TObject<number>;
export type TValueList = TObject<number[]>;

// Type for Callback
export type TCallback = (...args: any[]) => void;

// Type for Constructor 
// @ts-ignore
export type TNewOutputManager = new (oEngine: Engine, oOutputOptions?: IOutputOptions) => OutputManager;