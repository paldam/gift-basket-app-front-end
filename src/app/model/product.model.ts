import {ProductType} from './product_type.model';
import {Supplier} from "./supplier.model";
import {ProductSubType} from "./product_sub_type";
import {ProductSeason} from "./product_season.model";

export class Product {
	constructor(
		public id?: number,
		public productName?: string,
		public productCatalogName?: string,
		public deliver?: string,
		public capacity?: number,
		public price?: number,
		public stock?: number,
		public tmpStock?: number,
		public tmpOrdered?: number,
		public isArchival?: number,
		public suppliers?: Supplier[],
		public productType?: ProductType,
		public productSeason?: ProductSeason,
		public productSubType?: ProductSubType,
		public lastStockEditDate?: Date,
		public isProductImg?: number,
	) {
	}
}
