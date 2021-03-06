import {Response} from '@angular/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Basket} from '../model/basket.model';
import {BasketType} from '../model/basket_type.model';
import {HttpService} from "../http-service";
import {BasketExt} from '../model/BasketExt';

@Injectable()
export class BasketExtService {
	public protocol: string = "http";
	public port: number = 8080;
	public baseUrl: string;

	public constructor(private http: HttpService) {
		this.baseUrl = `${this.protocol}://${location.hostname}:${this.port}`;
	}

	saveBasket(basket: BasketExt): Observable<Response> {
		return this.http.post(this.baseUrl + `/basketext/`, basket)
			.map((response: Response) => response.json());
	}

	editBasket(basket: BasketExt): Observable<Response> {
		return this.http.post(this.baseUrl + `/basketextedit/`, basket)
			.map((response: Response) => response.json());
	}

	changeStatus(basket: BasketExt): Observable<Response> {
		return this.http.post(this.baseUrl + `/basketextstatus/`, basket)
			.map((response: Response) => response.json());
	}

	getBaskets(): Observable<Basket[]> {
		return this.http.get(this.baseUrl + `/basketsextlist/`)
			.map((response: Response) => response.json());
	}

	getDeletedBaskets(): Observable<Basket[]> {
		return this.http.get(this.baseUrl + `/deletedbaskets/`)
			.map((response: Response) => response.json());
	}

	getBasket(id: number): Observable<Basket> {
		return this.http.get(this.baseUrl + `/basket/${id}`)
			.map((response: Response) => response.json());
	}

	getNumberOfBasketOrdered(startDate, endDate): Observable<any[]> {
		return this.http.get(this.baseUrl + `/baskets/statistic/daterange?startDate=${startDate}&endDate=${endDate}`)
			.map((response: Response) =>
				response.json());
	}

	getBasketsTypes(): Observable<BasketType[]> {
		return this.http.get(this.baseUrl + `/baskets/types`)
			.map((response: Response) => response.json());
	}
}


