import {BasketType} from './basket_type.model';
import {BasketItems} from './basket_items.model';

export class Basket{

    constructor(
        public basketId?: number,
        public basketName?: string,
        public basketType?: BasketType,
        public basketItems?: BasketItems[],
        public basketTotalPrice?:number,
        public season?: string,
        public isAlcoholic?: number,
        public isAvailable?: number,
        public isBasketImg?: number
        ) {
    }
}
