import {Response} from '@angular/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Customer} from '../model/customer.model';
import {HttpService} from "../http-service";


@Injectable()
export class CustomerService {

    public protocol: string = "http";
    public port: number = 8080;
    public baseUrl: string;

    public constructor(private http : HttpService){
        this.baseUrl = `${this.protocol}://${location.hostname}:${this.port}`;
    }


    getCustomers(): Observable<Customer[]> {
        return this.http.get(this.baseUrl+`/customers/`)
            .map((response: Response) => response.json());
    }

    saveCustomers(customer : Customer): Observable<Response> {
        return this.http.post(this.baseUrl+`/customers/`,customer)

    }

}

