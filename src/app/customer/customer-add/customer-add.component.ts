import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Customer} from "../../model/customer.model";
import {Address} from "../../model/address.model";
import {FormsModule,NgForm} from "@angular/forms";
import {CustomerService} from "../customer.service";
import {Router} from "@angular/router";
import {MessageService} from "primeng/api";

@Component({
  selector: 'app-customer-add',
  templateUrl: './customer-add.component.html',
  styleUrls: ['./customer-add.component.css']
})
export class CustomerAddComponent implements OnInit {

  @ViewChild('zip_code') el: any;
  public customer: Customer = new Customer();
  public customerAddress: Address = new Address();
  public formSubmitted: boolean = false;
  public pickCityByZipCode: boolean = false;
  public tmpCityList: any[]=[];

  constructor(private customerService: CustomerService, private router: Router, private messageService: MessageService) {
    this.customer.addresses = [];
  }

  ngOnInit() {
  }


  submitOrderForm(form: NgForm) {
    //this.showSuccess();
    this.formSubmitted = true;

    if (form.valid) {
      this.customerAddress.isPrimaryAddress=1;
      this.customer.addresses.push(this.customerAddress);
      this.customerService.saveCustomers(this.customer).subscribe(data => {

        form.reset();
        this.formSubmitted = false;
        this.showSuccessMassage();

      }, error => {

        console.log(error);


        this.messageService.add({
          severity: 'error',
          summary: 'Wystąpił błąd przy dodawaniu klienta',
          detail: "Status: " + error.status + ' ' + error.statusText,
          life: 8000
        });

      });

    }

  }

  cancelCreateCustomer() {
    this.router.navigateByUrl('/orders');
  }


  showSuccessMassage() {

    this.router.navigateByUrl('/orders').then(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Status',
        detail: 'Poprawnie dodano klienta do bazy',
        life: 6000
      });
    });

  }

  ZipCodeUtil(zipCode: string) {



    if(this.el.valid){
       this.pickCityByZipCode= true;
       this.customerService.getCityByZipCode(zipCode).subscribe(data=>{
            data.forEach((value) =>{
               this.tmpCityList.push(value.zipCode.city);

            } );
       })
    };

  }


  selectCity(city: string){
    this.customerAddress.cityName = city;
    this.tmpCityList=[];
    this.pickCityByZipCode= false;
  }

  clearOnCloseDialog(){
    this.tmpCityList=[];
  }
}