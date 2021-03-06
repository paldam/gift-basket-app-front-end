import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ProductsService} from "../../products/products.service";
import {CalendarSetingsComponent} from "../../primeNgCalendarSetings/calendarStings.component";
import {NgForm} from "@angular/forms";
import {SelectItem} from "primeng/api";
import * as XLSX from "xlsx";
import {DataTable} from "primeng/primeng";
import {AppConstants} from "../../constants";
import {ProductSubType} from "../../model/product_sub_type";
import {Supplier} from "../../model/supplier.model";
declare var $: any;

@Component({
	selector: 'app-statistic2',
	templateUrl: './statistic2.component.html',
	styleUrls: ['./statistic2.component.css']
})
export class Statistic2Component
	implements OnInit {
	public productsToOrder: any[] = [];
	value: Date;
	dateLang: any;
	public formSubmitted: boolean = false;
	public startDate: string;
	public endDate: string;
	public loading: boolean = false;
	public suppliers: SelectItem[] = [];
	public dateError: boolean = false;
	public productsType: SelectItem[] = [];
	@ViewChild('dt') el: DataTable;
	public paginatorValues = AppConstants.PAGINATOR_VALUES;
	@ViewChild('sortByOrderDate') sortByOrderDateCheckBox: ElementRef;

	constructor(private productSerive: ProductsService, private calendarSetingsComponent: CalendarSetingsComponent) {
		productSerive.getSuppliers().subscribe(data => {
			this.suppliers.push({label: '-- Wszyscy Dostawcy --', value: null});
			data.forEach(data => {
				this.suppliers.push({label: data.supplierName, value: data.supplierName});
			})
		});
		productSerive.getProductsSubTypes().subscribe((data: ProductSubType[]) => {
			data.forEach(value => {
				this.productsType.push({
					label: '' + value.subTypeName + '(' + value.productType.typeName + ')',
					value: value.subTypeName
				});
			})
		});
	}

	ngOnInit() {
		this.dateLang = this.calendarSetingsComponent.dateLang;
		let today = new Date();
		this.startDate = today.toISOString().substring(0, 10);
		this.endDate = today.toISOString().substring(0, 10);
		this.setCustomSupplierFilterToDataTable();
	}

	private setCustomSupplierFilterToDataTable() {
		this.el.filterConstraints['inCollection'] = function inCollection(value: Supplier[], filter: any): boolean {
			if (filter === undefined || filter === null) {
				return true;
			}
			if (value === undefined || value === null || value.length === 0) {
				return false;
			}
			for (let i = 0; i < value.length; i++) {
				if (value[i].supplierName.toLowerCase() === filter.toLowerCase()) {
					return true;
				}
			}
			return false;
		};
	}

	submitOrderForm(form: NgForm) {
		this.formSubmitted = true;
		if (this.startDate > this.endDate) {
			this.dateError = true;
		} else {
			if (this.sortByOrderDateCheckBox.nativeElement.checked) {
				this.productSerive.getProductsToOrderWithoutDeletedByOrderDate(this.startDate, this.endDate)
					.subscribe(data => {
						this.productsToOrder = data;
						this.setAdditionalColumnWithConcatSupplierString();
					})
			} else {
				this.productSerive.getProductsToOrderWithoutDeletedByDeliveryDate(this.startDate, this.endDate)
					.subscribe(data => {
						this.productsToOrder = data;
						this.setAdditionalColumnWithConcatSupplierString();
					})
			}
		}
	}

	private setAdditionalColumnWithConcatSupplierString() {
		this.productsToOrder.forEach(product => {
			let suppliersConcatString = '';
			product.suppliers.forEach(supplier => {
				suppliersConcatString = suppliersConcatString + " " + supplier.supplierName;
			});
			product.suppliersConcatString = suppliersConcatString;
		})
	}

	generateXls() {
		let filt: any[] = [];
		if (!this.el.filteredValue) {
			filt = this.el.value;
		} else {
			filt = this.el.filteredValue;
		}
		let dataToGenerateFile: any[] = [];
		for (let i = 0; i < filt.length; i++) {
			let tmpSupplierNameList = '';
			for (let n = 0; n < filt[i].suppliers.length; n++) {
				tmpSupplierNameList = tmpSupplierNameList + filt[i].suppliers[n].supplierName + " | ";
			}
			dataToGenerateFile[i] = {
				"Nazwa Produktu": filt[i].productName,
				"Pojemność": filt[i].capacity,
				"Cena": filt[i].price,
				"Potrzebna Ilość": filt[i].suma
			}
		}
		const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToGenerateFile);
		const workbook: XLSX.WorkBook = {Sheets: {'data': worksheet}, SheetNames: ['data']};
		let today = new Date();
		let date = today.getFullYear() + '' + (today.getMonth() + 1) + '' + today.getDate() + '_';
		let fileName = "Zestawienie_" + date + ".xls";
		XLSX.writeFile(workbook, fileName, {bookType: 'xls', type: 'buffer'});
	}
}
