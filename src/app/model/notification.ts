
	export class Notification {
	constructor(
		public id?: number,
		public notificationDate?: Date,
		public notificationText?: string,
		public wasRead?: boolean,
		public notiOrderContext?: number

	){
	}
}