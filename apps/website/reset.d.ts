import "@total-typescript/ts-reset";
import type {ILazyLoadInstance} from "vanilla-lazyload";
declare global {
  interface Document {
    lazyLoadInstance?: ILazyLoadInstance;
  }
}
