import {Response} from '@angular/http';
import {Injectable} from "@angular/core";
import {HttpService} from "./http-service";
import {Observable} from "rxjs/Observable";
import {User} from "./model/user.model";
import {Authorities} from "./model/authorities.model";
import {PasswordChange} from "./model/password_change.model";

@Injectable()
export class UserService {
	public protocol: string = "http";
	public port: number = 8080;
	public baseUrl: string;

	constructor(private http: HttpService) {
		this.baseUrl = `${this.protocol}://${location.hostname}:${this.port}`;
	}

	getUsers(): Observable<User[]> {
		return this.http.get(this.baseUrl + `/users_without_del`)
			.map((response: Response) =>
				response.json());
	}

	getProgramUsers(): Observable<User[]> {
		return this.http.get(this.baseUrl + `/program_users`)
			.map((response: Response) =>
				response.json());
	}

	getAuthorities(): Observable<Authorities[]> {
		return this.http.get(this.baseUrl + `/users/authorities`)
			.map((response: Response) =>
				response.json());
	}

	getAllProductionUsers(): Observable<any[]> {
		return this.http.get(this.baseUrl + `/production_users`)
			.map((response: Response) =>
				response.json());
	}

	saveUser(user: User): Observable<Response> {
		return this.http.post(this.baseUrl + `/users/`, user)
	}

	simpleEditUser(user: User): Observable<Response> {
		return this.http.post(this.baseUrl + `/useredit/`, user)
	}

	saveProgramUser(user: User): Observable<Response> {
		return this.http.post(this.baseUrl + `/program_users/`, user)
	}

	public updateUser(user: User): Observable<Response> {
		return this.http.put(this.baseUrl + `/users/`, user)
	}

	deleteUser(login: string): Observable<Response> {
		return this.http.delete(this.baseUrl + `/users/${login}`);
	}

	deleteProgramUser(login: string): Observable<Response> {
		return this.http.delete(this.baseUrl + `/programusers/${login}`)
	}

	resetPassword(login: string): Observable<Response> {
		return this.http.put(this.baseUrl + `/users/reset/${login}`, login)
	}

	changePassword(passwordChange: PasswordChange): Observable<Response> {
		return this.http.put(this.baseUrl + `/users/reset/`, passwordChange)
	}
}

