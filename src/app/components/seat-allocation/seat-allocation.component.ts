import { Component, OnInit, Inject } from '@angular/core';
import { faExclamationTriangle, faCaretUp, faCaretDown, faSyncAlt, faInfo, faFilePdf, faChevronUp, faChevronDown, faTrashAlt, faEllipsisV, faCheckCircle, faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SeatallocationService } from 'src/app/services/seatallocation.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastrService } from 'ngx-toastr';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { of, from } from 'rxjs';
import { concatMap,finalize, tap } from 'rxjs/operators';
import { lastValueFrom } from 'rxjs';
import { firstValueFrom } from 'rxjs';



@Component({
  selector: 'app-seat-allocation',
  templateUrl: './seat-allocation.component.html',
  styleUrls: ['./seat-allocation.component.scss']
})
export class SeatAllocationComponent implements OnInit {

  envMode='2017'
  selectedPartyId= ''
  progressPercentage: number = 0;

  identifyer = (index:number, item: any) => item.name;
  movies = [
    "Episode I - The Phantom Menace",
    "Episode II - Attack of the Clones",
    "Episode III - Revenge of the Sith",
    "Episode IV - A New Hope",
    "Episode V - The Empire Strikes Back",
    "Episode VI - Return of the Jedi",
    "Episode VII - The Force Awakens",
    "Episode VIII - The Last Jedi",
    "Episode IX – The Rise of Skywalker",
    "Episode X - The Phantom Menace",
    "Episode XI - Attack of the Clones",
    "Episode XII - Revenge of the Sith",
    "Episode XIII - A New Hope",
    "Episode XIV - The Empire Strikes Back",
    "Episode XV - Return of the Jedi",
    "Episode XVI - The Force Awakens",
    "Episode XVII - The Last Jedi",
    "Episode XVIII – The Rise of Skywalker",
    "Episode XIX - The Phantom Menace",
    "Episode XX - Attack of the Clones",
    "Episode XXI - Revenge of the Sith",
    "Episode XXII - A New Hope",
    "Episode XXIII - The Empire Strikes Back",
    "Episode XXIV - Return of the Jedi",
    "Episode XXV - The Force Awakens",
    "Episode XXVI - The Last Jedi",
    "Episode XXVII– The Rise of Skywalker"
  ];

  mainPanelIcon: number = -1;
  innerPanelIcon: number = -1;
  customCollapsedHeight: string = 'auto';
  customExpandedHeight: string = 'auto';
  /**FontAwesome Declaration**/
  faExclamationTriangle = faExclamationTriangle;
  faCaretUp = faCaretUp;
  faSyncAlt = faSyncAlt;
  faInfo = faInfo;
  faFilePdf = faFilePdf;
  faChevronUp = faChevronUp;
  faTrashAlt = faTrashAlt;
  faEllipsisV = faEllipsisV;
  faCheckCircle = faCheckCircle;
  faCaretDown = faCaretDown;
  faChevronDown = faChevronDown;

  setAssignButtons: any;
  allTablesClosed: boolean = false;
  respectiveTableName: string = '';
  isLoading: boolean = false;

  advancedSessions = [];
  programs = new Array();
  eventID = "";

  constructor(
    private sessionDialog: MatDialog,
    private matSnackBar: MatSnackBar,
    private toast: ToastrService,
    private seatallocationService: SeatallocationService) { }

  ngOnInit() {

    if(this.envMode== '2017'){
      this.seatallocationService.getselectedPartyId().subscribe(resp=>{
        this.selectedPartyId= resp.Items.$values[0].Properties.$values.find(val => val.Name == 'ID').Value
     
      })
    }
    this.isLoading = true;
    let currentURL = window.location.href;


   
    var url = new URL(currentURL);
    var eventKeyValue = url.searchParams.get("EventKey");
    this.eventID = eventKeyValue
    this.getPrograms();
  }

  // fetch the programs as per the current EventID
  async getPrograms() {
this.isLoading=true
    this.seatallocationService.getPrograms(this.eventID).subscribe(
      result => {
       
        if (result.length > 0) {
          let Functions = new Array();
          let RegistrationOptions = new Array();
          if (result[0].Functions.$values.length > 0) {
            Functions = result[0].Functions.$values.map((x: any) =>
              (<any>
                {
                  "EventFunctionId": x.EventFunctionId,
                  "EventFunctionCode": x.EventFunctionCode,
                  "Name": x.Name,
                  "Description": x.Description
                }))
          }
          if (result[0].RegistrationOptions.$values.length > 0) {
            RegistrationOptions = result[0].RegistrationOptions.$values.map((x: any) =>
              (<any>
                {
                  "EventFunctionId": x.EventFunctionId,
                  "EventFunctionCode": x.EventFunctionCode,
                  "Name": x.Name,
                  "Description": x.Description
                }))
          }
          this.programs = Functions.concat(RegistrationOptions);
          
          this.getSessions();
        } else {
          this.isLoading = false;
        }
      }, error => {
        this.toast.error("Something went wrong!! Please try again later!!", "Error");
        this.isLoading = false;
      }
    )
  }

  // fetch the sessions as per the current EventID
  async getSessions() {
    
    this.seatallocationService.getSessions(this.eventID).subscribe(
      result => {
        this.isLoading=true
        this.advancedSessions = [];
        this.mainPanelIcon = -1;
        this.innerPanelIcon = -1;
        if (result.length > 0) {
          result.map((ele: any, index) => {
            this.advancedSessions[index] = []
            ele.Properties.$values.map(ele1 => {
              if (ele1.Name == 'Programs') {
                this.advancedSessions[index][ele1.Name] = ele1.Value.split(",");
                this.advancedSessions[index]["programNames"] = []
                ele1.Value.split(",").map(ele2 => {
                  let Name = this.programs.filter(ele => ele.EventFunctionId == ele2.trim());
                  this.advancedSessions[index]["programNames"].push(Name.length > 0 ? Name[0].Name : '');
                  this.advancedSessions[index]["assignButtons"] = {
                    autoAssignAll: false,
                    autoAssignTable: false,
                    autoSelectionTable: false
                  };
                })
              } else {
                this.advancedSessions[index][ele1.Name] = typeof (ele1.Value) == 'object' ? ele1.Value.$value : ele1.Value;
              }
              this.advancedSessions[index]['multiSelectChecked']=false
            })
          })

          
          
           this.getTables();
          // this.isLoading = false;
        } else {
          this.isLoading = false;
        }
      }, error => {
        this.toast.error("Something went wrong!! Please try again later!!", "Error");
        this.isLoading = false;
      }
    )
  }

  // fetch the tables as per the current EventID
  async getTables() {
    this.isLoading=true
    this.seatallocationService.getTables(this.eventID).subscribe(
      result => {
        this.isLoading=true
        let abc = [];
        if (result.length > 0) {
          
          result.map((ele: any, index) => {
            abc[index] = []
            ele.Properties.$values.map(ele1 => {
              abc[index][ele1.Name] = typeof (ele1.Value) == 'object' ? ele1.Value.$value : ele1.Value;
            })
          })
          
          this.advancedSessions.map(ele => {
            ele['tables'] = abc.filter(ele1 => ele1.SessionID == ele.Ordinal);
          })
        }
       this.getRegitrants();
      }, error => {
        this.toast.error("Something went wrong!! Please try again later!!", "Error");
        this.isLoading = false;
      }
    )
  }

  // fetch the registrants as per the current EventID
  async getRegitrants() {
    
    this.advancedSessions.map((ele, index) => {
      this.seatallocationService.getRegistrants(this.eventID, ele.Ordinal).subscribe(
        result => {
          let registrantsResult = [];
          if (result.length > 0) {
            // result.map((ele1: any, index1) => {
            //   registrantsResult[index1] = []
            //   ele1.Properties.$values.map(ele1 => {
            //     registrantsResult[index1][ele1.Name] = typeof (ele1.Value) == 'object' ? ele1.Value.$value : ele1.Value;
            //   })
            // })


            result.forEach((ele1: any) => {
              const obj: any = {};
              ele1.Properties.$values.forEach((prop: any) => {
                obj[prop.Name] = typeof prop.Value === 'object' ? prop.Value.$value : prop.Value;
              });
              registrantsResult.push(obj);
            });


            registrantsResult = registrantsResult.sort((a, b) => parseInt(a.SortOrder) - parseInt(b.SortOrder));
            ele['allRegistrants'] = [];
            ele['allRegistrants'] = registrantsResult;
            ele['unallocatedRegistrants'] = [];
            ele['unallocatedRegistrants'] = registrantsResult.filter(ele1 => ele1.TableID == 0);
            ele['allocatedRegistrants'] = [];
            ele['allocatedRegistrants'] = registrantsResult.filter(ele1 => ele1.TableID != 0);
            if (ele.tables && ele.tables.length > 0) {
              ele.tables.map(ele1 => {
                ele1['tablesAllocatedRegistrants'] = registrantsResult.filter(ele2 => ele2.TableID == ele1.Ordinal);
                ele1['remainingUnallocatedRegistrantsSeats'] = parseInt(ele1.NumSeats) - parseInt(ele1['tablesAllocatedRegistrants'].length)
              })
            }
          }
          if (this.advancedSessions.length == index + 1) {
            // this.isLoading = false;
            this.advancedSessions.map((ele4, index4) => {
              
              if (ele4['allocatedRegistrants'] && ele4['allocatedRegistrants'].length > 0) {
                ele4['allocatedRegistrants'].map(ele1 => {
                  ele1['tableName'] = "";

                  

                  let filteredTables = ele4.tables?.filter(ele2 => ele2.Ordinal == ele1.TableID);
                  if (filteredTables && filteredTables.length > 0) {
                    ele1['tableName'] = filteredTables[0].TableName;
                  }
                })
              }
              if (this.advancedSessions.length == index4 + 1) {
                this.isLoading = false;
              }
            })
          }
        }, error => {
          this.toast.error("Something went wrong!! Please try again later!!", "Error");
        }
      )
    })
    
  }

  createRegistrantData(ele, response) {
  let properties = Array.isArray(ele.Properties?.$values) ? ele.Properties.$values : [];
  
  let RegistrantID = properties.find(ele1 => ele1.Name === 'GuestID' || ele1.Name === 'RegistrantID')?.Value || null;
  let FullName = properties.find(ele1 => ele1.Name === 'FullName')?.Value || null;
  let DisplayName = properties.find(ele1 => ele1.Name === 'DisplayName')?.Value || null;
  let AccessibilityNote = properties.find(ele1 => ele1.Name === 'AccessibilityNote')?.Value || null;
  let Accessibility = properties.find(ele1 => ele1.Name === 'Accessibility')?.Value || null;
  let Dietary = properties.find(ele1 => ele1.Name === 'Dietary')?.Value || null;
  let DietaryNote = properties.find(ele1 => ele1.Name === 'DietaryNote')?.Value || null;
  let SessionID = response.data[0]?.Properties?.$values?.find(ele1 => ele1.Name === 'Ordinal')?.Value || 0;
  let EventID = response.data[0]?.Properties?.$values?.find(ele1 => ele1.Name === 'EventID')?.Value || null;

  let tempData = {
    "$type": "Asi.Soa.Core.DataContracts.GenericEntityData, Asi.Contracts",
    "EntityTypeName": this.envMode === '2017' ? 'Psc_Event_Registrant_2017' : 'Psc_Event_Registrant',
    "Properties": {
      "$type": "Asi.Soa.Core.DataContracts.GenericPropertyDataCollection, Asi.Contracts",
      "$values": [
        { "Name": "SessionID", "Value": SessionID },
        { "Name": "EventID", "Value": EventID },
        { "Name": "RegistrantID", "Value": RegistrantID },
        { "Name": "RegistrantName", "Value": FullName },
        { "Name": "AccessibilityNote", "Value": AccessibilityNote },
        { "Name": "Accessibility", "Value": Accessibility },
        { "Name": "Dietary", "Value": Dietary },
        { "Name": "DietaryNote", "Value": DietaryNote },
        { "Name": "DisplayName", "Value": DisplayName ? DisplayName : FullName },
        { "Name": "SortOrder", "Value": { "$type": "System.Int32", "$value": 0 } },
        { "Name": "TableID", "Value": { "$type": "System.Int32", "$value": 0 } }
      ]
    }
  };

  if (this.envMode === '2017') {
    tempData.Properties.$values.push({
      "$type": `Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts`,
      "Name": "ContactKey",
      "Value": this.selectedPartyId
    }as any);
    if(!this.selectedPartyId){
      
    }
  }

  
  

  return tempData;
}




  // open dialog box to add/edit session
  async openSessionDialog(session = null, sessionIndex = null) {
    let existingSession = session;
    const dialogRef = this.sessionDialog.open(SessionDialogComponent, {
      width: '600px',
      data: { session: existingSession, programs: this.programs, eventID: this.eventID },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(async (response) => {

      



      if (response.type === 'add') {
        this.isLoading = true;
        if (response.data && response.data.length > 0) {
          let programNamesWithQuotes = '"' + 
            response.data[0].Properties.$values
              .find(ele => ele.Name === 'Programs')
              .Value.split(",")
              .join('","') + '"';
      
          try {
            let programNamesTableWithQuotes = await this.getTableFunctions();
            
            if (programNamesTableWithQuotes ) {
             
              const array1 = programNamesTableWithQuotes && programNamesTableWithQuotes!= '' ? (programNamesTableWithQuotes as string)?.replace(/"/g, "").split(","):[];
              const array2 = programNamesWithQuotes.replace(/"/g, "").split(",");
              
              const insideTable = array2.filter(item => array1.includes(item));
              const outsideTable = array2.filter(item => !array1.includes(item));
              
              
      
              let RegistrantsDetails = [];

              
      
              if (insideTable.length) {
                let result = await this.seatallocationService.getIQARegistrantsTableGuest('"' + insideTable.join('","') + '"').toPromise();
                if (result.length > 0) {
                  result = result.filter((thing, index, self) =>
                    index === self.findIndex(t => 
                      (t.Properties as any).$values.find(ele1 => ele1.Name === 'GuestID').Value ===
                      (thing.Properties as any).$values.find(ele1 => ele1.Name === 'GuestID').Value
                    )
                  );
      
                  for (const ele of result) {
                    RegistrantsDetails.push(this.createRegistrantData(ele, response));
                  }
                }
              }
      
              if (outsideTable.length) {
                let result2 = await this.seatallocationService.getIQARegistrants('"' + outsideTable.join('","') + '"').toPromise();
                if (result2.length > 0) {
                  result2 = result2.filter((thing, index, self) =>
                    index === self.findIndex(t => 
                      (t.Properties as any).$values.find(ele1 => ele1.Name === 'RegistrantID').Value ===
                      (thing.Properties as any).$values.find(ele1 => ele1.Name === 'RegistrantID').Value
                    )
                  );
      
                  for (const ele of result2) {
                    RegistrantsDetails.push(this.createRegistrantData(ele, response));
                  }
                }
              }
              

              if(RegistrantsDetails && RegistrantsDetails.length){
                await this.updatedRegistrant(RegistrantsDetails,response)
              }else{
                this.getPrograms();
              }

            }
          } catch (error) {
            console.error("Error occurred:", error);
          } finally {
            this.isLoading = false;
          }
        }
      } else if (response.type == 'Edit') {
        this.isLoading = true;
        if (response.data && response.data.length > 0) {
          let programNamesWithQuotes = '"' + response.data[0].Properties.$values.filter(ele => ele.Name == 'Programs')[0].Value.split(",").join('","') + '"';

          try {
            let programNamesTableWithQuotes = await this.getTableFunctions();
            if (programNamesTableWithQuotes) {
              const array1 = (programNamesTableWithQuotes as string).replace(/"/g, "").split(",");
              const array2 = programNamesWithQuotes.replace(/"/g, "").split(",");
              
              const insideTable = array2.filter(item => array1.includes(item));
              const outsideTable = array2.filter(item => !array1.includes(item));
              
              
      
              let RegistrantsDetails = [];
      
              if (insideTable.length) {
                let result = await this.seatallocationService.getIQARegistrantsTableGuest('"' + insideTable.join('","') + '"').toPromise();
                if (result.length > 0) {
                  result = result.filter((thing, index, self) =>
                    index === self.findIndex(t => 
                      (t.Properties as any).$values.find(ele1 => ele1.Name === 'GuestID').Value ===
                      (thing.Properties as any).$values.find(ele1 => ele1.Name === 'GuestID').Value
                    )
                  );
      
                  for (const ele of result) {
                    RegistrantsDetails.push(this.createRegistrantData(ele, response));
                  }
                }
              }
      
              if (outsideTable.length) {
                let result2 = await this.seatallocationService.getIQARegistrants('"' + outsideTable.join('","') + '"').toPromise();
                if (result2.length > 0) {
                  result2 = result2.filter((thing, index, self) =>
                    index === self.findIndex(t => 
                      (t.Properties as any).$values.find(ele1 => ele1.Name === 'RegistrantID').Value ===
                      (thing.Properties as any).$values.find(ele1 => ele1.Name === 'RegistrantID').Value
                    )
                  );
      
                  for (const ele of result2) {
                    RegistrantsDetails.push(this.createRegistrantData(ele, response));
                  }
                }
              }
              if(RegistrantsDetails && RegistrantsDetails.length){
                let filteredResult = [];
                RegistrantsDetails.map((ele: any, index) => {
                  filteredResult[index] = []
                  ele.Properties.$values.map(ele1 => {
                    
                    filteredResult[index][ele1.Name] = typeof (ele1.Value) == 'object' && ele1.Value!=null ? ele1.Value.$value : ele1.Value;
                  })
                })

                let uniqueNewRegistrants = filteredResult.filter(x => !this.advancedSessions[sessionIndex].allRegistrants.some(registrant => registrant.RegistrantID === x.RegistrantID));
                let uniqueOldRegistrants = this.advancedSessions[sessionIndex].allRegistrants.filter(x => !filteredResult.some(registrant => registrant.RegistrantID === x.RegistrantID));
                let uniqueOldRegistrantsCount = 0;
                if (uniqueOldRegistrants.length > 0) {
                  
                  uniqueOldRegistrants.map(ele => {
                    this.seatallocationService.deleteRegistrant(ele.Ordinal,this.selectedPartyId).subscribe(
                      deleteRegistrantResult => {
                        uniqueOldRegistrantsCount = uniqueOldRegistrantsCount + 1;
                        if (uniqueOldRegistrants.length == uniqueOldRegistrantsCount) {
                          uniqueOldRegistrantsCount = 0;
                          if (uniqueNewRegistrants.length > 0) {
                            uniqueNewRegistrants.map(ele1 => {
                              let RegistrantsDetails = {
                                "$type": "Asi.Soa.Core.DataContracts.GenericEntityData, Asi.Contracts",
                                "EntityTypeName": this.envMode == '2017'? 'Psc_Event_Registrant_2017' :'Psc_Event_Registrant',
                                
                                "Properties": {
                                  "$type": "Asi.Soa.Core.DataContracts.GenericPropertyDataCollection, Asi.Contracts",
                                  "$values": [{
                                    "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                                    "Name": "SessionID",
                                    "Value": {
                                      "$type": "System.Int32",
                                      "$value": response.data[0].Properties.$values.filter(ele2 => ele2.Name == 'Ordinal')[0].Value.$value
                                    }
                                  },
                                  {
                                    "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                                    "Name": "EventID",
                                    "Value": response.data[0].Properties.$values.filter(ele1 => ele1.Name == 'EventID')[0].Value
                                  },
                                  {
                                    "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                                    "Name": "RegistrantID",
                                    "Value": ele1.RegistrantID
                                  },
                                  {
                                    "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                                    "Name": "RegistrantName",
                                    "Value": ele1.FullName
                                  },
                                  {
                                    "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                                    "Name": "DisplayName",
                                    "Value": ele1.DisplayName ? ele1.DisplayName : ele1.FullName
                                  },
                                  {
                                    "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                                    "Name": "AccessibilityNote",
                                    "Value": ele1.AccessibilityNote
                                  },
                                  {
                                    "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                                    "Name": "Accessibility",
                                    "Value": ele1.Accessibility
                                  },
                                  {
                                    "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                                    "Name": "Dietary",
                                    "Value": ele1.Dietary
                                  },
                                  {
                                    "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                                    "Name": "DietaryNote",
                                    "Value": ele1.DietaryNote
                                  },
                                  {
                                    "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                                    "Name": "SortOrder",
                                    "Value": {
                                      "$type": "System.Int32",
                                      "$value": 0
                                    }
                                  },
                                  {
                                    "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                                    "Name": "TableID",
                                    "Value": {
                                      "$type": "System.Int32",
                                      "$value": 0
                                    }
                                  }
                                  ]
                                }
                              }
                              if(this.envMode=='2017' ){
                                RegistrantsDetails.Properties.$values.push({
                                  "$type":"Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                                  "Name":"ContactKey",
                                  "Value":this.selectedPartyId
                                }

                                )
                              }
                              
                              this.seatallocationService.addRegistrant(RegistrantsDetails).subscribe(
                                addRegistrantResult => {
                                  uniqueOldRegistrantsCount = uniqueOldRegistrantsCount + 1;
                                  if (uniqueNewRegistrants.length == uniqueOldRegistrantsCount) {
                                    this.seatallocationService.getRegistrants(response.data[0].Properties.$values.filter(ele1 => ele1.Name == 'EventID')[0].Value, response.data[0].Properties.$values.filter(ele1 => ele1.Name == 'Ordinal')[0].Value.$value).subscribe(
                                      (RegistrantsResult: any) => {
                                        let updatedRegistrantsResult = [];
                                        RegistrantsResult.map((ele3: any, RegistrantsResultIndex) => {
                                          updatedRegistrantsResult[RegistrantsResultIndex] = []
                                          ele3.Properties.$values.map(ele4 => {
                                            updatedRegistrantsResult[RegistrantsResultIndex][ele4.Name] = typeof (ele4.Value) == 'object' ? ele4.Value.$value : ele4.Value;
                                          })
                                        })

                                        let unallocatedRegistrants = updatedRegistrantsResult.filter(ele1 => ele1.SessionID == ele.Ordinal && ele1.TableID == 0);
                                        let allocatedRegistrants = updatedRegistrantsResult.filter(ele1 => ele1.SessionID == ele.Ordinal && ele1.TableID != 0);

                                        let sessionData = new Array();
                                        if(this.envMode=='2017'){
                                          sessionData.push({
                                            "$type":"Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                                            "Name":"ContactKey",
                                            "Value":this.selectedPartyId
                                          })
                                        }
                                        sessionData.push({
                                          "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                                          "Name": "Ordinal",
                                          "Value": { "$type": "System.Int32", "$value": response.data[0].Properties.$values.filter(ele5 => ele5.Name == 'Ordinal')[0].Value.$value }
                                        })
                                        sessionData.push({
                                          "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                                          "Name": "TotalUnallocated",
                                          "Value": { "$type": "System.Int32", "$value": unallocatedRegistrants.length }
                                        })
                                        sessionData.push({
                                          "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                                          "Name": "TotalAllocated",
                                          "Value": { "$type": "System.Int32", "$value": allocatedRegistrants.length }
                                        })
                                        sessionData.push({
                                          "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                                          "Name": "TotalSeats",
                                          "Value": { "$type": "System.Int32", "$value": response.data[0].Properties.$values.filter(ele5 => ele5.Name == 'TotalSeats')[0].Value.$value }
                                        })
                                        sessionData.push({
                                          "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                                          "Name": "TotalTables",
                                          "Value": { "$type": "System.Int32", "$value": response.data[0].Properties.$values.filter(ele5 => ele5.Name == 'TotalTables')[0].Value.$value }
                                        })
                                        sessionData.push({
                                          "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                                          "Name": "Programs",
                                          "Value": response.data[0].Properties.$values.filter(ele5 => ele5.Name == 'Programs')[0].Value
                                        })
                                        sessionData.push({
                                          "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                                          "Name": "SessionName",
                                          "Value": response.data[0].Properties.$values.filter(ele5 => ele5.Name == 'SessionName')[0].Value
                                        })
                                        sessionData.push({
                                          "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                                          "Name": "EventID",
                                          "Value": response.data[0].Properties.$values.filter(ele5 => ele5.Name == 'EventID')[0].Value
                                        })
                                        sessionData.push({
                                          "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                                          "Name": "SessionTimeStamp",
                                          "Value": response.data[0].Properties.$values.filter(ele5 => ele5.Name == 'SessionTimeStamp')[0].Value
                                        })
                      

                                        this.seatallocationService.updateSession({ sessionID: response.data[0].Properties.$values.filter(ele5 => ele5.Name == 'Ordinal')[0].Value.$value, session: sessionData ,selectedPartyId: this.selectedPartyId}).subscribe(
                                          result => {
                                            this.getPrograms();
                                          }, error => {
                                            this.toast.error("Something went wrong!! Please try again later!!", "Error");
                                          }
                                        )

                                      }, RegistrantsError => {
                                        this.toast.error("Something went wrong!! Please try again later!!", "Error");
                                      }
                                    )
                                  }
                                }, error => {
                                  this.toast.error("Something went wrong!! Please try again later!!", "Error");
                                }
                              )
                            })
                          } else {


                            this.seatallocationService.getRegistrants(response.data[0].Properties.$values.filter(ele1 => ele1.Name == 'EventID')[0].Value, response.data[0].Properties.$values.filter(ele1 => ele1.Name == 'Ordinal')[0].Value.$value).subscribe(
                              (RegistrantsResult: any) => {
                              
                                let updatedRegistrantsResult = [];
                            RegistrantsResult.map((ele3: any, RegistrantsResultIndex) => {
                              updatedRegistrantsResult[RegistrantsResultIndex] = []
                              ele3.Properties.$values.map(ele4 => {
                                updatedRegistrantsResult[RegistrantsResultIndex][ele4.Name] = typeof (ele4.Value) == 'object' ? ele4.Value.$value : ele4.Value;
                              })
                            })


                            let unallocatedRegistrants = updatedRegistrantsResult.filter(ele1 =>  ele1.TableID == 0);
                            let allocatedRegistrants = updatedRegistrantsResult.filter(ele1 => ele1.TableID != 0);

                            let sessionData = new Array();
                            if(this.envMode=='2017'){
                              sessionData.push({
                                "$type":"Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                                "Name":"ContactKey",
                                "Value":this.selectedPartyId
                              })
                            }
                            sessionData.push({
                              "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                              "Name": "Ordinal",
                              "Value": { "$type": "System.Int32", "$value": response.data[0].Properties.$values.filter(ele5 => ele5.Name == 'Ordinal')[0].Value.$value }
                            })
                            sessionData.push({
                              "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                              "Name": "TotalUnallocated",
                              "Value": { "$type": "System.Int32", "$value": unallocatedRegistrants.length  }
                            })
                            sessionData.push({
                              "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                              "Name": "TotalAllocated",
                              "Value": { "$type": "System.Int32", "$value": allocatedRegistrants.length }
                            })
                            sessionData.push({
                              "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                              "Name": "TotalSeats",
                              "Value": { "$type": "System.Int32", "$value": response.data[0].Properties.$values.filter(ele5 => ele5.Name == 'TotalSeats')[0].Value.$value }
                            })
                            sessionData.push({
                              "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                              "Name": "TotalTables",
                              "Value": { "$type": "System.Int32", "$value": response.data[0].Properties.$values.filter(ele5 => ele5.Name == 'TotalTables')[0].Value.$value }
                            })
                            sessionData.push({
                              "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                              "Name": "Programs",
                              "Value": response.data[0].Properties.$values.filter(ele5 => ele5.Name == 'Programs')[0].Value
                            })
                            sessionData.push({
                              "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                              "Name": "SessionName",
                              "Value": response.data[0].Properties.$values.filter(ele5 => ele5.Name == 'SessionName')[0].Value
                            })
                            sessionData.push({
                              "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                              "Name": "EventID",
                              "Value": response.data[0].Properties.$values.filter(ele5 => ele5.Name == 'EventID')[0].Value
                            })
                            sessionData.push({
                              "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                              "Name": "SessionTimeStamp",
                              "Value": response.data[0].Properties.$values.filter(ele5 => ele5.Name == 'SessionTimeStamp')[0].Value
                            })
                        
                             
                            this.seatallocationService.updateSession({ sessionID: response.data[0].Properties.$values.filter(ele5 => ele5.Name == 'Ordinal')[0].Value.$value, session: sessionData ,selectedPartyId: this.selectedPartyId}).subscribe(
                              result => {
                                this.getPrograms();
                              }, error => {
                                this.toast.error("Something went wrong!! Please try again later!!", "Error");
                              }
                            )


                              })


                          }
                        }else{

                        }
                      }, error => {
                        this.toast.error("Something went wrong!! Please try again later!!", "Error");
                      }
                    )
                  })
                } else {
                  // TODO
                  if (uniqueNewRegistrants.length > 0) {
                    uniqueNewRegistrants.map(ele1 => {
                      let RegistrantsDetails = {
                        "$type": "Asi.Soa.Core.DataContracts.GenericEntityData, Asi.Contracts",
                        "EntityTypeName": "Psc_Event_Registrant",
                        "PrimaryParentEntityTypeName": "Standalone",
                        "Identity": {
                          "$type": "Asi.Soa.Core.DataContracts.IdentityData, Asi.Contracts",
                          "EntityTypeName": "Psc_Event_Registrant",
                          "IdentityElements": {
                            "$type": "System.Collections.ObjectModel.Collection`1[[System.String, mscorlib]], mscorlib",
                            "$values": [""]
                          }
                        },
                        "PrimaryParentIdentity": {
                          "$type": "Asi.Soa.Core.DataContracts.IdentityData, Asi.Contracts",
                          "EntityTypeName": "Standalone",
                          "IdentityElements": {
                            "$type": "System.Collections.ObjectModel.Collection`1[[System.String, mscorlib]], mscorlib",
                            "$values": [""]
                          }
                        },
                        "Properties": {
                          "$type": "Asi.Soa.Core.DataContracts.GenericPropertyDataCollection, Asi.Contracts",
                          "$values": [{
                            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                            "Name": "SessionID",
                            "Value": {
                              "$type": "System.Int32",
                              "$value": response.data[0].Properties.$values.filter(ele2 => ele2.Name == 'Ordinal')[0].Value.$value
                            }
                          },
                          {
                            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                            "Name": "EventID",
                            "Value": response.data[0].Properties.$values.filter(ele1 => ele1.Name == 'EventID')[0].Value
                          },
                          {
                            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                            "Name": "RegistrantID",
                            "Value": ele1.RegistrantID
                          },
                          {
                            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                            "Name": "RegistrantName",
                            "Value": ele1.FullName ? ele1.FullName : ele1.RegistrantName
                          },
                          {
                            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                            "Name": "DisplayName",
                            "Value": ele1.DisplayName ? ele1.DisplayName : ele1.DisplayName
                          },
                          {
                            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                            "Name": "SortOrder",
                            "Value": {
                              "$type": "System.Int32",
                              "$value": 0
                            }
                          },
                          {
                            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                            "Name": "TableID",
                            "Value": {
                              "$type": "System.Int32",
                              "$value": 0
                            }
                          }
                          ]
                        }
                      }

                      if(this.envMode=='2017' ){
                        RegistrantsDetails.Properties.$values.push({
                          "$type":"Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                          "Name":"ContactKey",
                          "Value":this.selectedPartyId
                        }

                        )
                      }
                      
                      this.seatallocationService.addRegistrant(RegistrantsDetails).subscribe(
                        addRegistrantResult => {
                          uniqueOldRegistrantsCount = uniqueOldRegistrantsCount + 1;
                          if (uniqueNewRegistrants.length == uniqueOldRegistrantsCount) {
                            this.seatallocationService.getRegistrants(response.data[0].Properties.$values.filter(ele1 => ele1.Name == 'EventID')[0].Value, response.data[0].Properties.$values.filter(ele1 => ele1.Name == 'Ordinal')[0].Value.$value).subscribe(
                              (RegistrantsResult: any) => {
                                let updatedRegistrantsResult = [];
                                RegistrantsResult.map((ele3: any, RegistrantsResultIndex) => {
                                  updatedRegistrantsResult[RegistrantsResultIndex] = []
                                  ele3.Properties.$values.map(ele4 => {
                                    updatedRegistrantsResult[RegistrantsResultIndex][ele4.Name] = typeof (ele4.Value) == 'object' ? ele4.Value.$value : ele4.Value;
                                  })
                                })

                                let unallocatedRegistrants = updatedRegistrantsResult.filter(ele1 => ele1.TableID == 0);
                                let allocatedRegistrants = updatedRegistrantsResult.filter(ele1 => ele1.TableID != 0);

                                let sessionData = new Array();
                                if(this.envMode=='2017'){
                                  sessionData.push({
                                    "$type":"Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                                    "Name":"ContactKey",
                                    "Value":this.selectedPartyId
                                  })
                                }
                                sessionData.push({
                                  "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                                  "Name": "Ordinal",
                                  "Value": { "$type": "System.Int32", "$value": response.data[0].Properties.$values.filter(ele5 => ele5.Name == 'Ordinal')[0].Value.$value }
                                })
                                sessionData.push({
                                  "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                                  "Name": "TotalUnallocated",
                                  "Value": { "$type": "System.Int32", "$value": unallocatedRegistrants.length }
                                })
                                sessionData.push({
                                  "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                                  "Name": "TotalAllocated",
                                  "Value": { "$type": "System.Int32", "$value": allocatedRegistrants.length }
                                })
                                sessionData.push({
                                  "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                                  "Name": "TotalSeats",
                                  "Value": { "$type": "System.Int32", "$value": response.data[0].Properties.$values.filter(ele5 => ele5.Name == 'TotalSeats')[0].Value.$value }
                                })
                                sessionData.push({
                                  "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                                  "Name": "TotalTables",
                                  "Value": { "$type": "System.Int32", "$value": response.data[0].Properties.$values.filter(ele5 => ele5.Name == 'TotalTables')[0].Value.$value }
                                })
                                sessionData.push({
                                  "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                                  "Name": "Programs",
                                  "Value": response.data[0].Properties.$values.filter(ele5 => ele5.Name == 'Programs')[0].Value
                                })
                                sessionData.push({
                                  "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                                  "Name": "SessionName",
                                  "Value": response.data[0].Properties.$values.filter(ele5 => ele5.Name == 'SessionName')[0].Value
                                })
                                sessionData.push({
                                  "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                                  "Name": "EventID",
                                  "Value": response.data[0].Properties.$values.filter(ele5 => ele5.Name == 'EventID')[0].Value
                                })
                                sessionData.push({
                                  "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                                  "Name": "SessionTimeStamp",
                                  "Value": response.data[0].Properties.$values.filter(ele5 => ele5.Name == 'SessionTimeStamp')[0].Value
                                })
                                
                                this.seatallocationService.updateSession({ sessionID: response.data[0].Properties.$values.filter(ele5 => ele5.Name == 'Ordinal')[0].Value.$value, session: sessionData ,selectedPartyId: this.selectedPartyId}).subscribe(
                                  result => {
                                    this.getPrograms();
                                  }, error => {
                                    this.toast.error("Something went wrong!! Please try again later!!", "Error");
                                  }
                                )
                              }, RegistrantsError => {
                                this.toast.error("Something went wrong!! Please try again later!!", "Error");
                              }
                            )
                          }
                        }, error => {
                          this.toast.error("Something went wrong!! Please try again later!!", "Error");
                        }
                      )
                    })
                  } else {
                    this.getPrograms();
                  }
                }
              } else {
                
                let increamentedValue = 0;
                if (this.advancedSessions[sessionIndex].allRegistrants.length != 0) {
                  
                  this.advancedSessions[sessionIndex].allRegistrants.map(ele => {
                    this.seatallocationService.deleteRegistrant(ele.Ordinal,this.selectedPartyId).subscribe(
                      deleteRegistrantResult => {
                        increamentedValue = increamentedValue + 1;
                        if (increamentedValue == this.advancedSessions[sessionIndex].allRegistrants.length) {
                          let sessionData = new Array();
                          if(this.envMode=='2017'){
                            sessionData.push({
                              "$type":"Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                              "Name":"ContactKey",
                              "Value":this.selectedPartyId
                            })
                          }
                          sessionData.push({
                            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                            "Name": "Ordinal",
                            "Value": { "$type": "System.Int32", "$value": response.data[0].Properties.$values.filter(ele1 => ele1.Name == 'Ordinal')[0].Value.$value }
                          })
                          sessionData.push({
                            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                            "Name": "TotalUnallocated",
                            "Value": { "$type": "System.Int32", "$value": 0 }
                          })
                          sessionData.push({
                            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                            "Name": "TotalAllocated",
                            "Value": { "$type": "System.Int32", "$value": 0 }
                          })
                          sessionData.push({
                            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                            "Name": "TotalSeats",
                            "Value": { "$type": "System.Int32", "$value": response.data[0].Properties.$values.filter(ele1 => ele1.Name == 'TotalSeats')[0].Value.$value }
                          })
                          sessionData.push({
                            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                            "Name": "TotalTables",
                            "Value": { "$type": "System.Int32", "$value": response.data[0].Properties.$values.filter(ele1 => ele1.Name == 'TotalTables')[0].Value.$value }
                          })
                          sessionData.push({
                            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                            "Name": "Programs",
                            "Value": response.data[0].Properties.$values.filter(ele1 => ele1.Name == 'Programs')[0].Value
                          })
                          sessionData.push({
                            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                            "Name": "SessionName",
                            "Value": response.data[0].Properties.$values.filter(ele1 => ele1.Name == 'SessionName')[0].Value
                          })
                          sessionData.push({
                            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                            "Name": "EventID",
                            "Value": response.data[0].Properties.$values.filter(ele1 => ele1.Name == 'EventID')[0].Value
                          })
                          sessionData.push({
                            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                            "Name": "SessionTimeStamp",
                            "Value": response.data[0].Properties.$values.filter(ele1 => ele1.Name == 'SessionTimeStamp')[0].Value
                          })
                          
                          this.seatallocationService.updateSession({ sessionID: response.data[0].Properties.$values.filter(ele1 => ele1.Name == 'Ordinal')[0].Value.$value, session: sessionData ,selectedPartyId: this.selectedPartyId}).subscribe(
                            result => {
                              this.getPrograms();
                            }, error => {
                              this.toast.error("Something went wrong!! Please try again later!!", "Error");
                            }
                          )
                        }
                      }, deleteRegistrantError => {
                        this.toast.error("Something went wrong!! Please try again later!!", "Error");
                      }
                    )
                  })
                } else {
                  this.getPrograms();
                }
              }

            }
            
        
        // this.getPrograms();
          
             
          }catch (error) {
            console.error("Error occurred:", error);
          } finally {
            this.isLoading = false;
          }
        }



          // this.seatallocationService.getIQARegistrants(programNamesWithQuotes).subscribe(
          //   (result: any) => {
          //     if (result.length > 0) {
          //       result = result.filter((thing, index, self) =>
          //         index === self.findIndex((t) => (
          //           t.Properties.$values.filter(ele1 => ele1.Name == 'RegistrantID')[0].Value === thing.Properties.$values.filter(ele1 => ele1.Name == 'RegistrantID')[0].Value
          //         ))
          //       )
          //       let filteredResult = [];
          //       result.map((ele: any, index) => {
          //         filteredResult[index] = []
          //         ele.Properties.$values.map(ele1 => {
          //           filteredResult[index][ele1.Name] = typeof (ele1.Value) == 'object' ? ele1.Value.$value : ele1.Value;
          //         })
          //       })
          //       let uniqueNewRegistrants = filteredResult.filter(x => !this.advancedSessions[sessionIndex].allRegistrants.some(registrant => registrant.RegistrantID === x.RegistrantID));
          //       let uniqueOldRegistrants = this.advancedSessions[sessionIndex].allRegistrants.filter(x => !filteredResult.some(registrant => registrant.RegistrantID === x.RegistrantID));
          //       let uniqueOldRegistrantsCount = 0;
          //       if (uniqueOldRegistrants.length > 0) {
                  
          //         uniqueOldRegistrants.map(ele => {
          //           this.seatallocationService.deleteRegistrant(ele.Ordinal,this.selectedPartyId).subscribe(
          //             deleteRegistrantResult => {
          //               uniqueOldRegistrantsCount = uniqueOldRegistrantsCount + 1;
          //               if (uniqueOldRegistrants.length == uniqueOldRegistrantsCount) {
          //                 uniqueOldRegistrantsCount = 0;
          //                 if (uniqueNewRegistrants.length > 0) {
          //                   uniqueNewRegistrants.map(ele1 => {
          //                     let RegistrantsDetails = {
          //                       "$type": "Asi.Soa.Core.DataContracts.GenericEntityData, Asi.Contracts",
          //                       "EntityTypeName": this.envMode == '2017'? 'Psc_Event_Registrant_2017' :'Psc_Event_Registrant',
                                
          //                       "Properties": {
          //                         "$type": "Asi.Soa.Core.DataContracts.GenericPropertyDataCollection, Asi.Contracts",
          //                         "$values": [{
          //                           "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
          //                           "Name": "SessionID",
          //                           "Value": {
          //                             "$type": "System.Int32",
          //                             "$value": response.data[0].Properties.$values.filter(ele2 => ele2.Name == 'Ordinal')[0].Value.$value
          //                           }
          //                         },
          //                         {
          //                           "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
          //                           "Name": "EventID",
          //                           "Value": response.data[0].Properties.$values.filter(ele1 => ele1.Name == 'EventID')[0].Value
          //                         },
          //                         {
          //                           "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
          //                           "Name": "RegistrantID",
          //                           "Value": ele1.RegistrantID
          //                         },
          //                         {
          //                           "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
          //                           "Name": "RegistrantName",
          //                           "Value": ele1.FullName
          //                         },
          //                         {
          //                           "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
          //                           "Name": "SortOrder",
          //                           "Value": {
          //                             "$type": "System.Int32",
          //                             "$value": 0
          //                           }
          //                         },
          //                         {
          //                           "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
          //                           "Name": "TableID",
          //                           "Value": {
          //                             "$type": "System.Int32",
          //                             "$value": 0
          //                           }
          //                         }
          //                         ]
          //                       }
          //                     }
          //                     if(this.envMode=='2017' ){
          //                       RegistrantsDetails.Properties.$values.push({
          //                         "$type":"Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
          //                         "Name":"ContactKey",
          //                         "Value":this.selectedPartyId
          //                       }

          //                       )
          //                     }
                              
          //                     this.seatallocationService.addRegistrant(RegistrantsDetails).subscribe(
          //                       addRegistrantResult => {
          //                         uniqueOldRegistrantsCount = uniqueOldRegistrantsCount + 1;
          //                         if (uniqueNewRegistrants.length == uniqueOldRegistrantsCount) {
          //                           this.seatallocationService.getRegistrants(response.data[0].Properties.$values.filter(ele1 => ele1.Name == 'EventID')[0].Value, response.data[0].Properties.$values.filter(ele1 => ele1.Name == 'Ordinal')[0].Value.$value).subscribe(
          //                             (RegistrantsResult: any) => {
          //                               let updatedRegistrantsResult = [];
          //                               RegistrantsResult.map((ele3: any, RegistrantsResultIndex) => {
          //                                 updatedRegistrantsResult[RegistrantsResultIndex] = []
          //                                 ele3.Properties.$values.map(ele4 => {
          //                                   updatedRegistrantsResult[RegistrantsResultIndex][ele4.Name] = typeof (ele4.Value) == 'object' ? ele4.Value.$value : ele4.Value;
          //                                 })
          //                               })

          //                               let unallocatedRegistrants = updatedRegistrantsResult.filter(ele1 => ele1.SessionID == ele.Ordinal && ele1.TableID == 0);
          //                               let allocatedRegistrants = updatedRegistrantsResult.filter(ele1 => ele1.SessionID == ele.Ordinal && ele1.TableID != 0);

          //                               let sessionData = new Array();
          //                               if(this.envMode=='2017'){
          //                                 sessionData.push({
          //                                   "$type":"Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
          //                                   "Name":"ContactKey",
          //                                   "Value":this.selectedPartyId
          //                                 })
          //                               }
          //                               sessionData.push({
          //                                 "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
          //                                 "Name": "Ordinal",
          //                                 "Value": { "$type": "System.Int32", "$value": response.data[0].Properties.$values.filter(ele5 => ele5.Name == 'Ordinal')[0].Value.$value }
          //                               })
          //                               sessionData.push({
          //                                 "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
          //                                 "Name": "TotalUnallocated",
          //                                 "Value": { "$type": "System.Int32", "$value": unallocatedRegistrants.length }
          //                               })
          //                               sessionData.push({
          //                                 "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
          //                                 "Name": "TotalAllocated",
          //                                 "Value": { "$type": "System.Int32", "$value": allocatedRegistrants.length }
          //                               })
          //                               sessionData.push({
          //                                 "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
          //                                 "Name": "TotalSeats",
          //                                 "Value": { "$type": "System.Int32", "$value": response.data[0].Properties.$values.filter(ele5 => ele5.Name == 'TotalSeats')[0].Value.$value }
          //                               })
          //                               sessionData.push({
          //                                 "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
          //                                 "Name": "TotalTables",
          //                                 "Value": { "$type": "System.Int32", "$value": response.data[0].Properties.$values.filter(ele5 => ele5.Name == 'TotalTables')[0].Value.$value }
          //                               })
          //                               sessionData.push({
          //                                 "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
          //                                 "Name": "Programs",
          //                                 "Value": response.data[0].Properties.$values.filter(ele5 => ele5.Name == 'Programs')[0].Value
          //                               })
          //                               sessionData.push({
          //                                 "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
          //                                 "Name": "SessionName",
          //                                 "Value": response.data[0].Properties.$values.filter(ele5 => ele5.Name == 'SessionName')[0].Value
          //                               })
          //                               sessionData.push({
          //                                 "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
          //                                 "Name": "EventID",
          //                                 "Value": response.data[0].Properties.$values.filter(ele5 => ele5.Name == 'EventID')[0].Value
          //                               })
          //                               sessionData.push({
          //                                 "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
          //                                 "Name": "SessionTimeStamp",
          //                                 "Value": response.data[0].Properties.$values.filter(ele5 => ele5.Name == 'SessionTimeStamp')[0].Value
          //                               })
                                        
          //                               this.seatallocationService.updateSession({ sessionID: response.data[0].Properties.$values.filter(ele5 => ele5.Name == 'Ordinal')[0].Value.$value, session: sessionData ,selectedPartyId: this.selectedPartyId}).subscribe(
          //                                 result => {
          //                                   this.getPrograms();
          //                                 }, error => {
          //                                   this.toast.error("Something went wrong!! Please try again later!!", "Error");
          //                                 }
          //                               )

          //                             }, RegistrantsError => {
          //                               this.toast.error("Something went wrong!! Please try again later!!", "Error");
          //                             }
          //                           )
          //                         }
          //                       }, error => {
          //                         this.toast.error("Something went wrong!! Please try again later!!", "Error");
          //                       }
          //                     )
          //                   })
          //                 } else {
          //                   this.getPrograms();
          //                 }
          //               }
          //             }, error => {
          //               this.toast.error("Something went wrong!! Please try again later!!", "Error");
          //             }
          //           )
          //         })
          //       } else {
          //         // TODO
          //         if (uniqueNewRegistrants.length > 0) {
          //           uniqueNewRegistrants.map(ele1 => {
          //             let RegistrantsDetails = {
          //               "$type": "Asi.Soa.Core.DataContracts.GenericEntityData, Asi.Contracts",
          //               "EntityTypeName": "Psc_Event_Registrant",
          //               "PrimaryParentEntityTypeName": "Standalone",
          //               "Identity": {
          //                 "$type": "Asi.Soa.Core.DataContracts.IdentityData, Asi.Contracts",
          //                 "EntityTypeName": "Psc_Event_Registrant",
          //                 "IdentityElements": {
          //                   "$type": "System.Collections.ObjectModel.Collection`1[[System.String, mscorlib]], mscorlib",
          //                   "$values": [""]
          //                 }
          //               },
          //               "PrimaryParentIdentity": {
          //                 "$type": "Asi.Soa.Core.DataContracts.IdentityData, Asi.Contracts",
          //                 "EntityTypeName": "Standalone",
          //                 "IdentityElements": {
          //                   "$type": "System.Collections.ObjectModel.Collection`1[[System.String, mscorlib]], mscorlib",
          //                   "$values": [""]
          //                 }
          //               },
          //               "Properties": {
          //                 "$type": "Asi.Soa.Core.DataContracts.GenericPropertyDataCollection, Asi.Contracts",
          //                 "$values": [{
          //                   "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
          //                   "Name": "SessionID",
          //                   "Value": {
          //                     "$type": "System.Int32",
          //                     "$value": response.data[0].Properties.$values.filter(ele2 => ele2.Name == 'Ordinal')[0].Value.$value
          //                   }
          //                 },
          //                 {
          //                   "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
          //                   "Name": "EventID",
          //                   "Value": response.data[0].Properties.$values.filter(ele1 => ele1.Name == 'EventID')[0].Value
          //                 },
          //                 {
          //                   "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
          //                   "Name": "RegistrantID",
          //                   "Value": ele1.RegistrantID
          //                 },
          //                 {
          //                   "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
          //                   "Name": "RegistrantName",
          //                   "Value": ele1.FullName
          //                 },
          //                 {
          //                   "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
          //                   "Name": "SortOrder",
          //                   "Value": {
          //                     "$type": "System.Int32",
          //                     "$value": 0
          //                   }
          //                 },
          //                 {
          //                   "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
          //                   "Name": "TableID",
          //                   "Value": {
          //                     "$type": "System.Int32",
          //                     "$value": 0
          //                   }
          //                 }
          //                 ]
          //               }
          //             }
                      
          //             this.seatallocationService.addRegistrant(RegistrantsDetails).subscribe(
          //               addRegistrantResult => {
          //                 uniqueOldRegistrantsCount = uniqueOldRegistrantsCount + 1;
          //                 if (uniqueNewRegistrants.length == uniqueOldRegistrantsCount) {
          //                   this.seatallocationService.getRegistrants(response.data[0].Properties.$values.filter(ele1 => ele1.Name == 'EventID')[0].Value, response.data[0].Properties.$values.filter(ele1 => ele1.Name == 'Ordinal')[0].Value.$value).subscribe(
          //                     (RegistrantsResult: any) => {
          //                       let updatedRegistrantsResult = [];
          //                       RegistrantsResult.map((ele3: any, RegistrantsResultIndex) => {
          //                         updatedRegistrantsResult[RegistrantsResultIndex] = []
          //                         ele3.Properties.$values.map(ele4 => {
          //                           updatedRegistrantsResult[RegistrantsResultIndex][ele4.Name] = typeof (ele4.Value) == 'object' ? ele4.Value.$value : ele4.Value;
          //                         })
          //                       })

          //                       let unallocatedRegistrants = updatedRegistrantsResult.filter(ele1 => ele1.TableID == 0);
          //                       let allocatedRegistrants = updatedRegistrantsResult.filter(ele1 => ele1.TableID != 0);

          //                       let sessionData = new Array();
          //                       if(this.envMode=='2017'){
          //                         sessionData.push({
          //                           "$type":"Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
          //                           "Name":"ContactKey",
          //                           "Value":this.selectedPartyId
          //                         })
          //                       }
          //                       sessionData.push({
          //                         "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
          //                         "Name": "Ordinal",
          //                         "Value": { "$type": "System.Int32", "$value": response.data[0].Properties.$values.filter(ele5 => ele5.Name == 'Ordinal')[0].Value.$value }
          //                       })
          //                       sessionData.push({
          //                         "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
          //                         "Name": "TotalUnallocated",
          //                         "Value": { "$type": "System.Int32", "$value": unallocatedRegistrants.length }
          //                       })
          //                       sessionData.push({
          //                         "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
          //                         "Name": "TotalAllocated",
          //                         "Value": { "$type": "System.Int32", "$value": allocatedRegistrants.length }
          //                       })
          //                       sessionData.push({
          //                         "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
          //                         "Name": "TotalSeats",
          //                         "Value": { "$type": "System.Int32", "$value": response.data[0].Properties.$values.filter(ele5 => ele5.Name == 'TotalSeats')[0].Value.$value }
          //                       })
          //                       sessionData.push({
          //                         "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
          //                         "Name": "TotalTables",
          //                         "Value": { "$type": "System.Int32", "$value": response.data[0].Properties.$values.filter(ele5 => ele5.Name == 'TotalTables')[0].Value.$value }
          //                       })
          //                       sessionData.push({
          //                         "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
          //                         "Name": "Programs",
          //                         "Value": response.data[0].Properties.$values.filter(ele5 => ele5.Name == 'Programs')[0].Value
          //                       })
          //                       sessionData.push({
          //                         "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
          //                         "Name": "SessionName",
          //                         "Value": response.data[0].Properties.$values.filter(ele5 => ele5.Name == 'SessionName')[0].Value
          //                       })
          //                       sessionData.push({
          //                         "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
          //                         "Name": "EventID",
          //                         "Value": response.data[0].Properties.$values.filter(ele5 => ele5.Name == 'EventID')[0].Value
          //                       })
          //                       sessionData.push({
          //                         "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
          //                         "Name": "SessionTimeStamp",
          //                         "Value": response.data[0].Properties.$values.filter(ele5 => ele5.Name == 'SessionTimeStamp')[0].Value
          //                       })
                                
          //                       this.seatallocationService.updateSession({ sessionID: response.data[0].Properties.$values.filter(ele5 => ele5.Name == 'Ordinal')[0].Value.$value, session: sessionData ,selectedPartyId: this.selectedPartyId}).subscribe(
          //                         result => {
          //                           this.getPrograms();
          //                         }, error => {
          //                           this.toast.error("Something went wrong!! Please try again later!!", "Error");
          //                         }
          //                       )
          //                     }, RegistrantsError => {
          //                       this.toast.error("Something went wrong!! Please try again later!!", "Error");
          //                     }
          //                   )
          //                 }
          //               }, error => {
          //                 this.toast.error("Something went wrong!! Please try again later!!", "Error");
          //               }
          //             )
          //           })
          //         } else {
          //           this.getPrograms();
          //         }
          //       }
          //     } else {
          //       let increamentedValue = 0;
          //       if (this.advancedSessions[sessionIndex].allRegistrants.length != 0) {
                  
          //         this.advancedSessions[sessionIndex].allRegistrants.map(ele => {
          //           this.seatallocationService.deleteRegistrant(ele.Ordinal,this.selectedPartyId).subscribe(
          //             deleteRegistrantResult => {
          //               increamentedValue = increamentedValue + 1;
          //               if (increamentedValue == this.advancedSessions[sessionIndex].allRegistrants.length) {
          //                 let sessionData = new Array();
          //                 if(this.envMode=='2017'){
          //                   sessionData.push({
          //                     "$type":"Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
          //                     "Name":"ContactKey",
          //                     "Value":this.selectedPartyId
          //                   })
          //                 }
          //                 sessionData.push({
          //                   "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
          //                   "Name": "Ordinal",
          //                   "Value": { "$type": "System.Int32", "$value": response.data[0].Properties.$values.filter(ele1 => ele1.Name == 'Ordinal')[0].Value.$value }
          //                 })
          //                 sessionData.push({
          //                   "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
          //                   "Name": "TotalUnallocated",
          //                   "Value": { "$type": "System.Int32", "$value": 0 }
          //                 })
          //                 sessionData.push({
          //                   "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
          //                   "Name": "TotalAllocated",
          //                   "Value": { "$type": "System.Int32", "$value": 0 }
          //                 })
          //                 sessionData.push({
          //                   "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
          //                   "Name": "TotalSeats",
          //                   "Value": { "$type": "System.Int32", "$value": response.data[0].Properties.$values.filter(ele1 => ele1.Name == 'TotalSeats')[0].Value.$value }
          //                 })
          //                 sessionData.push({
          //                   "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
          //                   "Name": "TotalTables",
          //                   "Value": { "$type": "System.Int32", "$value": response.data[0].Properties.$values.filter(ele1 => ele1.Name == 'TotalTables')[0].Value.$value }
          //                 })
          //                 sessionData.push({
          //                   "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
          //                   "Name": "Programs",
          //                   "Value": response.data[0].Properties.$values.filter(ele1 => ele1.Name == 'Programs')[0].Value
          //                 })
          //                 sessionData.push({
          //                   "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
          //                   "Name": "SessionName",
          //                   "Value": response.data[0].Properties.$values.filter(ele1 => ele1.Name == 'SessionName')[0].Value
          //                 })
          //                 sessionData.push({
          //                   "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
          //                   "Name": "EventID",
          //                   "Value": response.data[0].Properties.$values.filter(ele1 => ele1.Name == 'EventID')[0].Value
          //                 })
          //                 sessionData.push({
          //                   "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
          //                   "Name": "SessionTimeStamp",
          //                   "Value": response.data[0].Properties.$values.filter(ele1 => ele1.Name == 'SessionTimeStamp')[0].Value
          //                 })
                          
          //                 this.seatallocationService.updateSession({ sessionID: response.data[0].Properties.$values.filter(ele1 => ele1.Name == 'Ordinal')[0].Value.$value, session: sessionData ,selectedPartyId: this.selectedPartyId}).subscribe(
          //                   result => {
          //                     this.getPrograms();
          //                   }, error => {
          //                     this.toast.error("Something went wrong!! Please try again later!!", "Error");
          //                   }
          //                 )
          //               }
          //             }, deleteRegistrantError => {
          //               this.toast.error("Something went wrong!! Please try again later!!", "Error");
          //             }
          //           )
          //         })
          //       } else {
          //         this.getPrograms();
          //       }
          //     }
          //   }, error => {
          //     this.toast.error("Something went wrong!! Please try again later!!", "Error");
          //   }
          // )
        // } else {
        //   this.isLoading = false;
        // }
        // this.getPrograms();
      } else if (response.type == 'delete') {
        this.isLoading = true;
        this.seatallocationService.getRegistrants(this.eventID, this.advancedSessions[sessionIndex].Ordinal).subscribe(
          result => {

            
            if (result.length > 0) {
              let updatedRegistrantsResult = [];
              result.map((ele3: any, RegistrantsResultIndex) => {
                updatedRegistrantsResult[RegistrantsResultIndex] = []
                ele3.Properties.$values.map(ele4 => {
                  updatedRegistrantsResult[RegistrantsResultIndex][ele4.Name] = typeof (ele4.Value) == 'object' ? ele4.Value.$value : ele4.Value;
                })
              })
              let increamentedValue = 0;
              
              // updatedRegistrantsResult.map(ele => {
              //   this.seatallocationService.deleteRegistrant(ele.Ordinal,this.selectedPartyId).subscribe(
              //     deleteRegistrantResult => {
              //       increamentedValue = increamentedValue + 1;
              //       if (increamentedValue == updatedRegistrantsResult.length) {
              //         this.getPrograms();
              //       }
              //     }, deleteRegistrantError => {
              //       this.toast.error("Something went wrong!! Please try again later!!", "Error");
              //     }
              //   )
              // })

              // let increamentedValue = 0;
              const totalRequests = updatedRegistrantsResult.length;

              from(updatedRegistrantsResult).pipe(
                concatMap(ele => this.seatallocationService.deleteRegistrant(ele.Ordinal, this.selectedPartyId))
              ).subscribe(
                deleteRegistrantResult => {
                  increamentedValue = increamentedValue + 1;
                  
                  this.progressPercentage = (increamentedValue / totalRequests) * 100;
                  if (increamentedValue === updatedRegistrantsResult.length) {
                    this.getPrograms();
                  }
                },
                deleteRegistrantError => {
                  this.toast.error("Something went wrong!! Please try again later!!", "Error");
                }
              );
            } else {
              this.isLoading = false;
            }
          }, error => {
            this.toast.error("Something went wrong!! Please try again later!!", "Error");
          }
        )
        // this.getPrograms();
        // this.advancedSessions.splice(sessionIndex, 1);
      }
    });
  }

//   async updatedRegistrant(RegistrantsDetails, response){
    
//       let increamentedValue = 0;
//       const totalRequests = RegistrantsDetails.length;
//       
//       from(RegistrantsDetails).pipe(
//         concatMap(RegistrantElement => this.seatallocationService.addRegistrant(RegistrantElement)),
//         finalize(() => {

//           

//           if (increamentedValue === totalRequests) {
//             const eventID = response.data[0].Properties.$values.filter(ele1 => ele1.Name == 'EventID')[0].Value;
//             const ordinal = response.data[0].Properties.$values.filter(ele1 => ele1.Name == 'Ordinal')[0].Value.$value;
            
//             this.seatallocationService.getRegistrants(eventID, ordinal).subscribe(
//               (RegistrantsResult: any) => {
                
//                 this.updateSession(response, RegistrantsResult.length);
//               },
//               RegistrantsError => {
//                 this.toast.error("Something went wrong!! Please try again later!!", "Error");
//               }
//             );
//           }
//         })
//       ).subscribe(
//         RegistrantResult => {
//           increamentedValue += 1;
// 
//           this.progressPercentage = (increamentedValue / totalRequests) * 100;
//         },
//         RegistrantError => {
//           this.toast.error("Something went wrong!! Please try again later!!", "Error");
//         }
//       );
//       RegistrantsDetails.map((RegistrantElement, RegistrantIndex) => {
//         this.seatallocationService.addRegistrant(RegistrantElement).subscribe(
//           RegistrantResult => {

//              increamentedValue = increamentedValue + 1;
//             
//             if (increamentedValue == RegistrantsDetails.length) {
//               this.seatallocationService.getRegistrants(response.data[0].Properties.$values.filter(ele1 => ele1.Name == 'EventID')[0].Value, response.data[0].Properties.$values.filter(ele1 => ele1.Name == 'Ordinal')[0].Value.$value).subscribe(
//                 (RegistrantsResult: any) => {
      
//                   this.updateSession(response, RegistrantsResult.length);
//                 }, RegistrantsError => {
//                   this.toast.error("Something went wrong!! Please try again later!!", "Error");
//                 }
//               )
//             }
//           }, RegistrantError => {
//             this.toast.error("Something went wrong!! Please try again later!!", "Error");
//           }
//         )
//       })
    
//   }




// async updatedRegistrant(RegistrantsDetails, response) {
//   let completedRequests = 0;
//   const totalRequests = RegistrantsDetails.length;
 
// this.isLoading=true
//   from(RegistrantsDetails).pipe(
//     concatMap(Registrant => this.seatallocationService.addRegistrant(Registrant)),
//     tap(() => {
//       this.isLoading=true
//       completedRequests++;
//       this.progressPercentage = (completedRequests / totalRequests) * 100;
//     }),
//     finalize(() => {
//       this.isLoading=false
      
//       if (completedRequests === totalRequests) {
//         const eventID = response.data[0].Properties.$values.find(ele => ele.Name === "EventID")?.Value;
//         const ordinal = response.data[0].Properties.$values.find(ele => ele.Name === "Ordinal")?.Value?.$value;

//         if (eventID && ordinal) {
//           this.seatallocationService.getRegistrants(eventID, ordinal).subscribe(
//             (registrants) => this.updateSession(response, registrants.length),
//             () => this.toast.error("Something went wrong! Please try again.", "Error")
//           );
//         }
//       }
//     })
//   ).subscribe(
//     () => {},
//     () => this.toast.error("Something went wrong! Please try again.", "Error")
//   );
// }


async updatedRegistrant(RegistrantsDetails, response) {
  let completedRequests = 0;
  const totalRequests = RegistrantsDetails.length;

  this.isLoading = true;
  
  from(RegistrantsDetails).pipe(
    concatMap((Registrant: any) => {

      

      const contactKey = Registrant?.Properties?.$values?.find((prop: any) => prop.Name === 'ContactKey')?.Value;
      
      if (!contactKey && this.envMode == '2017') {
        // Skip API call if ContactKey is missing or empty
        return of(null);
      }

      return this.seatallocationService.addRegistrant(Registrant);
    }),
    tap(() => {
      this.isLoading=true
      completedRequests++;
      this.progressPercentage = (completedRequests / totalRequests) * 100;
    }),
    finalize(() => {
      this.isLoading = false;
      if (completedRequests === totalRequests) {
        const eventID = response.data[0].Properties.$values.find(ele => ele.Name === "EventID")?.Value;
        const ordinal = response.data[0].Properties.$values.find(ele => ele.Name === "Ordinal")?.Value?.$value;

        if (eventID && ordinal) {
          this.seatallocationService.getRegistrants(eventID, ordinal).subscribe(
            (registrants) => this.updateSession(response, registrants.length),
            () => this.toast.error("Something went wrong! Please try again.", "Error")
          );
        }
      }
    })
  ).subscribe(
    () => {},
    () => this.toast.error("Something went wrong! Please try again.", "Error")
  );
}





  async getTableFunctions()  {
    return new Promise((resolve, reject) => {
      this.seatallocationService.getTableFunction(this.eventID).subscribe({
        next: (resp) => {
          
          // let programItems = resp.Items.$values[0].Properties.$values.find(
          //   (prop) => prop.Name === "ProgramItems"
          // )?.Value;

          let programItems2= resp.Items.$values.map(x=>{
            return x.Properties.$values.find(
              (prop) => prop.Name === "ProgramItems"
            )?.Value;
          })
         


          resolve(programItems2 ? '"' + programItems2.join('","') + '"' : []);
        },
        error: (error) => {
          console.error("Error fetching table functions", error);
          reject([]);
        },
      });
    });
  }
  

  // open dialog box to add/edit session table
  addEditSessionTable(sessionIndex, sessionTableIndex = -1) {
    let dialogRef = this.sessionDialog.open(SessionTableDialogComponent, {
      panelClass: "mat-dialog-lg",
      width: "500px",
      data: {
        sessionTable: sessionTableIndex != -1 ? this.advancedSessions[sessionIndex].tables[sessionTableIndex] : null,
        session: this.advancedSessions[sessionIndex],
        eventID: this.eventID
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(response => {
      if (response.type == 'addEdit' || response.type == 'delete') {
        this.isLoading = true;
        this.getPrograms();
      }
    });
  }

  // expansion panel code for future use starts
  // beforePanelClosed(panel){
  //   panel.isExpanded = false;
  //   
  // }
  // beforePanelOpened(panel){
  //   panel.isExpanded = true;
  //   
  // }
  // expansion panel code for future use ends

  // main expansion pannel open and closed controls handeling starts
  afterPanelClosed(i) {
    var preval = this.mainPanelIcon;
    if (preval < i) {
      this.mainPanelIcon = preval;
    } else {
      this.mainPanelIcon = -1;
    }
  }

  afterPanelOpened(i) {
    this.mainPanelIcon = i;
  }
  // main expansion pannel open and closed controls handeling ends

  // inner expansion pannel open and closed constrols handeling starts
  innerPannelOpened(i, j) {
    this.innerPanelIcon = j;
    this.advancedSessions[i]['tableOpened'] = this.advancedSessions[i].tables[j];
  }

  innerPanelClosed(i, j) {
    var preval = this.innerPanelIcon;
    if (preval < j) {
      this.innerPanelIcon = preval;
    } else {
      this.innerPanelIcon = -1;
      this.advancedSessions[i]['tableOpened'] = null;
    }
  }
  // inner expansion pannel open and closed constrols handling ends

  do(event) {
    event.preventDefault();
  }

  showAssignButtons(assignButtons) {
    this.setAssignButtons = assignButtons
  }

  onCheckChange(event, tablesArr) {
    if (event.checked) {
      if (this.setAssignButtons.tables.length > 0) {
        this.setAssignButtons.assignButtons.autoAssignTable = false;
        this.setAssignButtons.assignButtons.autoSelectionTable = true;
        this.setAssignButtons.assignButtons.autoAssignAll = false;
        if (this.respectiveTableName === '') {
          this.setAssignButtons.assignButtons.autoSelectionTable = false;
          this.respectiveTableName = tablesArr[0].TableName
          this.allTablesClosed = true;
        }
      }
    } else {
      if (this.setAssignButtons.tables.length > 0) {
        this.setAssignButtons.assignButtons.autoAssignTable = true;
        this.setAssignButtons.assignButtons.autoSelectionTable = false;
        this.setAssignButtons.assignButtons.autoAssignAll = false;
      }
      if (this.allTablesClosed) {
        this.setAssignButtons.assignButtons.autoAssignTable = false;
        this.setAssignButtons.assignButtons.autoSelectionTable = false;
        this.setAssignButtons.assignButtons.autoAssignAll = true;
      }
    }
  }

  // remove session program from the session programs chips
  removeSessionProgram(programIndex: number, sessionIndex: number) {
    this.matSnackBar.open(`Delete ${this.advancedSessions[sessionIndex].Programs[programIndex].name}?`, 'DELETE', { duration: 5000 })
      .onAction().subscribe(() => {
        this.advancedSessions[sessionIndex].Programs.splice(programIndex, 1);
      });
  }

  // update new session
  async updateSession(response, UnallocatedRegistrants) {
    let sessionData = new Array();
    if(this.envMode=='2017'){
      sessionData.push({
        "$type":"Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
        "Name":"ContactKey",
        "Value":this.selectedPartyId
      })
    }
    sessionData.push({
      "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
      "Name": "Ordinal",
      "Value": { "$type": "System.Int32", "$value": response.data[0].Properties.$values.filter(ele1 => ele1.Name == 'Ordinal')[0].Value.$value }
    })
    sessionData.push({
      "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
      "Name": "TotalUnallocated",
      "Value": { "$type": "System.Int32", "$value": UnallocatedRegistrants }
    })
    sessionData.push({
      "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
      "Name": "TotalAllocated",
      "Value": { "$type": "System.Int32", "$value": response.data[0].Properties.$values.filter(ele1 => ele1.Name == 'TotalAllocated')[0].Value.$value }
    })
    sessionData.push({
      "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
      "Name": "TotalSeats",
      "Value": { "$type": "System.Int32", "$value": response.data[0].Properties.$values.filter(ele1 => ele1.Name == 'TotalSeats')[0].Value.$value }
    })
    sessionData.push({
      "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
      "Name": "TotalTables",
      "Value": { "$type": "System.Int32", "$value": response.data[0].Properties.$values.filter(ele1 => ele1.Name == 'TotalTables')[0].Value.$value }
    })
    sessionData.push({
      "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
      "Name": "Programs",
      "Value": response.data[0].Properties.$values.filter(ele1 => ele1.Name == 'Programs')[0].Value
    })
    sessionData.push({
      "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
      "Name": "SessionName",
      "Value": response.data[0].Properties.$values.filter(ele1 => ele1.Name == 'SessionName')[0].Value
    })
    sessionData.push({
      "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
      "Name": "EventID",
      "Value": response.data[0].Properties.$values.filter(ele1 => ele1.Name == 'EventID')[0].Value
    })
    sessionData.push({
      "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
      "Name": "SessionTimeStamp",
      "Value": response.data[0].Properties.$values.filter(ele1 => ele1.Name == 'SessionTimeStamp')[0].Value
    })
    
    this.seatallocationService.updateSession({ sessionID: response.data[0].Properties.$values.filter(ele1 => ele1.Name == 'Ordinal')[0].Value.$value, session: sessionData ,selectedPartyId: this.selectedPartyId}).subscribe(
      result => {
        this.getPrograms();
      }, error => {
        this.toast.error("Something went wrong!! Please try again later!!", "Error");
      }
    )
  }

  // checked unchecked checkboxes for multi select
  selectUnselectMultiSelect(event, sessionIndex) {
    if (event) {
      let totalCheckCountSelection = 0;
      if (this.advancedSessions[sessionIndex].unallocatedRegistrants.length == 0) {
        this.advancedSessions[sessionIndex]['multiSelectChecked'] = false;
        this.advancedSessions[sessionIndex]['multiSelectIndeterminate'] = false;
      } else {
        this.advancedSessions[sessionIndex].unallocatedRegistrants.map((ele, index) => {
          ele.multiSelect = true;
          totalCheckCountSelection += 1;
          if (this.advancedSessions[sessionIndex].unallocatedRegistrants.length == index + 1 && totalCheckCountSelection == 0) {
            this.advancedSessions[sessionIndex]['multiSelectChecked'] = false;
            this.advancedSessions[sessionIndex]['multiSelectIndeterminate'] = false;
          }
        })
      }
    } else {
      this.advancedSessions[sessionIndex].unallocatedRegistrants.map((ele, index) => {
        ele.multiSelect = false;
      })
    }
  }

  // checked unchecked checkboxes for multi select on single checkbox
  multiSelectCheckBoxes(sessionIndex) {
    let checkCountSelection = 0;
    let totalCheckCountSelection = 0;
    this.advancedSessions[sessionIndex].unallocatedRegistrants.map((ele, index) => {
      if (ele.multiSelect) {
        checkCountSelection += 1;
      }
      totalCheckCountSelection += 1;

      if (this.advancedSessions[sessionIndex].unallocatedRegistrants.length == index + 1) {
        if (totalCheckCountSelection != 0) {
          if (totalCheckCountSelection == checkCountSelection) {
            this.advancedSessions[sessionIndex]['multiSelectChecked'] = true;
            this.advancedSessions[sessionIndex]['multiSelectIndeterminate'] = false;
          } else if (totalCheckCountSelection > checkCountSelection && checkCountSelection != 0) {
            this.advancedSessions[sessionIndex]['multiSelectChecked'] = false;
            this.advancedSessions[sessionIndex]['multiSelectIndeterminate'] = true;
          } else if (totalCheckCountSelection > 0 && checkCountSelection == 0) {
            this.advancedSessions[sessionIndex]['multiSelectChecked'] = false;
            this.advancedSessions[sessionIndex]['multiSelectIndeterminate'] = false;
          }
        } else {
          this.advancedSessions[sessionIndex]['multiSelectChecked'] = false;
          this.advancedSessions[sessionIndex]['multiSelectIndeterminate'] = false;
        }
      }
    })
  }





  

  async autoAssignAll(sessionIndex) {
    this.isLoading = true;
    let totalUnallocated = 0;
    let unallocatedTableDetails = [];
  
    this.advancedSessions[sessionIndex].tables.forEach(ele => {
      totalUnallocated += parseInt(ele.remainingUnallocatedRegistrantsSeats);
      for (let i = 0; i < parseInt(ele.remainingUnallocatedRegistrantsSeats); i++) {
        unallocatedTableDetails.push(ele);
      }
    });
  
    if (totalUnallocated > 0) {
      let unallocatedRegistrants = this.advancedSessions[sessionIndex].unallocatedRegistrants;
      let RegistrantsData = [];
  
      for (let i = 0; i < totalUnallocated; i++) {
        if (unallocatedRegistrants.length > i) {
          const registrantProps = [
            {
              "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
              "Name": "Ordinal",
              "Value": {
                "$type": "System.Int32",
                "$value": unallocatedRegistrants[i].Ordinal
              }
            },
            {
              "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
              "Name": "SessionID",
              "Value": {
                "$type": "System.Int32",
                "$value": unallocatedRegistrants[i].SessionID
              }
            },
            {
              "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
              "Name": "EventID",
              "Value": unallocatedRegistrants[i].EventID
            },
            {
              "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
              "Name": "RegistrantID",
              "Value": unallocatedRegistrants[i].RegistrantID
            },
            {
              "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
              "Name": "RegistrantName",
              "Value": unallocatedRegistrants[i].RegistrantName
            },
            {
              "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
              "Name": "SortOrder",
              "Value": {
                "$type": "System.Int32",
                "$value": 0
              }
            },
            {
              "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
              "Name": "TableID",
              "Value": {
                "$type": "System.Int32",
                "$value": unallocatedTableDetails[i].Ordinal
              }
            }
          ];
  
          if (this.envMode === '2017') {
            registrantProps.push({
              "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
              "Name": "ContactKey",
              "Value": this.selectedPartyId
            });
          }
  
          RegistrantsData.push({
            registrantID: unallocatedRegistrants[i].Ordinal,
            registrant: registrantProps
          });
        }
      }
  
      // Sequentially update each registrant
      for (const reg of RegistrantsData) {
        try {
          await firstValueFrom(this.seatallocationService.updateRegistrant(reg, this.selectedPartyId));
        } catch (error) {
          this.toast.error("Something went wrong while updating registrant. Please try again later!!", "Error");
          this.isLoading = false;
          return;
        }
      }
  
      try {
        const result1 = await firstValueFrom(
          this.seatallocationService.getRegistrants(this.eventID, this.advancedSessions[sessionIndex].Ordinal)
        );
  
        let registrantsResult = [];
        result1.map((ele1: any, index) => {
          registrantsResult[index] = [];
          ele1.Properties.$values.map((ele1) => {
            registrantsResult[index][ele1.Name] = typeof ele1.Value === 'object' ? ele1.Value.$value : ele1.Value;
          });
        });
  
        
        const unallocatedRegistrantsLength = registrantsResult.filter(ele1 => ele1.TableID == 0);
        const allocatedRegistrantsLength = registrantsResult.filter(ele1 => ele1.TableID != 0);
  
        const sessionData = [];
  
        if (this.envMode === '2017') {
          sessionData.push({
            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
            "Name": "ContactKey",
            "Value": this.selectedPartyId
          });
        }
  
        sessionData.push(
          {
            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
            "Name": "Ordinal",
            "Value": { "$type": "System.Int32", "$value": this.advancedSessions[sessionIndex].Ordinal }
          },
          {
            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
            "Name": "TotalUnallocated",
            "Value": { "$type": "System.Int32", "$value": unallocatedRegistrantsLength.length }
          },
          {
            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
            "Name": "TotalAllocated",
            "Value": { "$type": "System.Int32", "$value": allocatedRegistrantsLength.length }
          },
          {
            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
            "Name": "TotalSeats",
            "Value": { "$type": "System.Int32", "$value": this.advancedSessions[sessionIndex].TotalSeats }
          },
          {
            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
            "Name": "TotalTables",
            "Value": { "$type": "System.Int32", "$value": this.advancedSessions[sessionIndex].TotalTables }
          },
          {
            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
            "Name": "Programs",
            "Value": this.advancedSessions[sessionIndex].Programs.toString()
          },
          {
            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
            "Name": "SessionName",
            "Value": this.advancedSessions[sessionIndex].SessionName
          },
          {
            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
            "Name": "EventID",
            "Value": this.advancedSessions[sessionIndex].EventID
          },
          {
            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
            "Name": "SessionTimeStamp",
            "Value": this.advancedSessions[sessionIndex].SessionTimeStamp
          }
        );
  
        await firstValueFrom(
          this.seatallocationService.updateSession({
            sessionID: this.advancedSessions[sessionIndex].Ordinal,
            session: sessionData,
            selectedPartyId: this.selectedPartyId
          })
        );
  
        this.toast.success("Auto Assign All has been completed. Please wait while we are updating the records!!", "Success");
        this.getPrograms();
  
      } catch (error) {
        this.toast.error("Something went wrong!! Please try again later!!", "Error");
      }
    }
  
    this.isLoading = false;
  }
  




  // auto assign the registrants to all the tables
  // async autoAssignAll(sessionIndex) {
  //   this.isLoading = true;
  //   let totalUnallocated = 0;
  //   let unallocatedTableDetails = [];

  //   this.advancedSessions[sessionIndex].tables.map(ele => {
  //     totalUnallocated = totalUnallocated + parseInt(ele.remainingUnallocatedRegistrantsSeats);
  //     for (let i = 0; i < parseInt(ele.remainingUnallocatedRegistrantsSeats); i++) {
  //       unallocatedTableDetails.push(ele);
  //     }
  //   })

  //   if (totalUnallocated > 0) {
  //     let unallocatedRegistrants = this.advancedSessions[sessionIndex].unallocatedRegistrants;
  //     let RegistrantsData = [];

  //     for (let i = 0; i < totalUnallocated; i++) {
  //       if (unallocatedRegistrants.length > i) {
  //         RegistrantsData.push({
  //           registrantID: unallocatedRegistrants[i].Ordinal,
  //           registrant: [{
  //             "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //             "Name": "Ordinal",
  //             "Value": {
  //               "$type": "System.Int32",
  //               "$value": unallocatedRegistrants[i].Ordinal
  //             }
  //           },
  //           {
  //             "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //             "Name": "SessionID",
  //             "Value": {
  //               "$type": "System.Int32",
  //               "$value": unallocatedRegistrants[i].SessionID
  //             }
  //           },
  //           {
  //             "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //             "Name": "EventID",
  //             "Value": unallocatedRegistrants[i].EventID
  //           },
  //           {
  //             "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //             "Name": "RegistrantID",
  //             "Value": unallocatedRegistrants[i].RegistrantID
  //           },
  //           {
  //             "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //             "Name": "RegistrantName",
  //             "Value": unallocatedRegistrants[i].RegistrantName
  //           },
  //           {
  //             "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //             "Name": "SortOrder",
  //             "Value": {
  //               "$type": "System.Int32",
  //               "$value": 0
  //             }
  //           },
  //           {
  //             "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //             "Name": "TableID",
  //             "Value": {
  //               "$type": "System.Int32",
  //               "$value": unallocatedTableDetails[i].Ordinal
  //             }
  //           }]
            
  //         });
  //         if(this.envMode== '2017'){
  //             RegistrantsData[i].registrant.push(
  //               {
  //                 "$type":"Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //                 "Name":"ContactKey",
  //                 "Value":this.selectedPartyId
  //               }
  //             )
  //         }
  //       }
  //       if (totalUnallocated == i + 1) {
  //         let increamentedValue = 0;
  //         RegistrantsData.map(ele => {
  //           this.seatallocationService.updateRegistrant(ele,this.selectedPartyId).subscribe(
  //             result => {
  //               increamentedValue = increamentedValue + 1;
  //               if (increamentedValue == RegistrantsData.length) {
  //                 this.seatallocationService.getRegistrants(this.eventID, this.advancedSessions[sessionIndex].Ordinal).subscribe(
  //                   result1 => {
  //                     let registrantsResult = [];
  //                     result1.map((ele1: any, index) => {
  //                       registrantsResult[index] = []
  //                       ele1.Properties.$values.map(ele1 => {
  //                         registrantsResult[index][ele1.Name] = typeof (ele1.Value) == 'object' ? ele1.Value.$value : ele1.Value;
  //                       })
  //                     })

  //                     let unallocatedRegistrantsLength = registrantsResult.filter(ele1 => ele1.TableID == 0);
  //                     let allocatedRegistrantsLength = registrantsResult.filter(ele1 => ele1.TableID != 0);

  //                     let sessionData = new Array();
  //                     if(this.envMode=='2017'){
  //                       sessionData.push({
  //                         "$type":"Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //                         "Name":"ContactKey",
  //                         "Value":this.selectedPartyId
  //                       })
  //                     }
  //                     sessionData.push({
  //                       "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //                       "Name": "Ordinal",
  //                       "Value": { "$type": "System.Int32", "$value": this.advancedSessions[sessionIndex].Ordinal }
  //                     })
  //                     sessionData.push({
  //                       "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //                       "Name": "TotalUnallocated",
  //                       "Value": { "$type": "System.Int32", "$value": unallocatedRegistrantsLength.length }
  //                     })
  //                     sessionData.push({
  //                       "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //                       "Name": "TotalAllocated",
  //                       "Value": { "$type": "System.Int32", "$value": allocatedRegistrantsLength.length }
  //                     })
  //                     sessionData.push({
  //                       "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //                       "Name": "TotalSeats",
  //                       "Value": { "$type": "System.Int32", "$value": this.advancedSessions[sessionIndex].TotalSeats }
  //                     })
  //                     sessionData.push({
  //                       "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //                       "Name": "TotalTables",
  //                       "Value": { "$type": "System.Int32", "$value": this.advancedSessions[sessionIndex].TotalTables }
  //                     })
  //                     sessionData.push({
  //                       "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //                       "Name": "Programs",
  //                       "Value": this.advancedSessions[sessionIndex].Programs.toString()
  //                     })
  //                     sessionData.push({
  //                       "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //                       "Name": "SessionName",
  //                       "Value": this.advancedSessions[sessionIndex].SessionName
  //                     })
  //                     sessionData.push({
  //                       "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //                       "Name": "EventID",
  //                       "Value": this.advancedSessions[sessionIndex].EventID
  //                     })
  //                     sessionData.push({
  //                       "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //                       "Name": "SessionTimeStamp",
  //                       "Value": this.advancedSessions[sessionIndex].SessionTimeStamp
  //                     })
                      
  //                     this.seatallocationService.updateSession({ sessionID: this.advancedSessions[sessionIndex].Ordinal, session: sessionData,selectedPartyId: this.selectedPartyId }).subscribe(
  //                       result => {
  //                         this.toast.success("Auto Assign All has been completed. Please wait while we are updating the records!!", "Success");
  //                         this.getPrograms();
  //                       }, error => {
  //                         this.toast.error("Something went wrong!! Please try again later!!", "Error");
  //                       }
  //                     )
  //                   }, error1 => {
  //                     this.toast.error("Something went wrong!! Please try again later!!", "Error");
  //                   }
  //                 )
  //               }
  //             }, error => {
  //               this.toast.error("Something went wrong!! Please try again later!!", "Error");
  //             }
  //           )
  //         })
  //       }
  //     }
  //   } else {
  //     this.isLoading = false;
  //   }
  // }

  // auto assign the registrants to the selected table
  // async autoAssignAllToTable(sessionIndex) {
  //   this.isLoading = true;
  //   if (this.advancedSessions[sessionIndex].tables.filter(ele => ele.Ordinal == this.advancedSessions[sessionIndex].tableOpened.Ordinal)[0].remainingUnallocatedRegistrantsSeats > 0) {
  //     let unallocatedRegistrants = this.advancedSessions[sessionIndex].unallocatedRegistrants;
  //     let RegistrantsData = [];

  //     for (let i = 0; i < this.advancedSessions[sessionIndex].tables.filter(ele => ele.Ordinal == this.advancedSessions[sessionIndex].tableOpened.Ordinal)[0].remainingUnallocatedRegistrantsSeats; i++) {
  //       if (unallocatedRegistrants.length > i) {
  //         RegistrantsData.push({
  //           registrantID: unallocatedRegistrants[i].Ordinal,
  //           registrant: [{
  //             "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //             "Name": "Ordinal",
  //             "Value": {
  //               "$type": "System.Int32",
  //               "$value": unallocatedRegistrants[i].Ordinal
  //             }
  //           },
  //           {
  //             "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //             "Name": "SessionID",
  //             "Value": {
  //               "$type": "System.Int32",
  //               "$value": unallocatedRegistrants[i].SessionID
  //             }
  //           },
  //           {
  //             "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //             "Name": "EventID",
  //             "Value": unallocatedRegistrants[i].EventID
  //           },
  //           {
  //             "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //             "Name": "RegistrantID",
  //             "Value": unallocatedRegistrants[i].RegistrantID
  //           },
  //           {
  //             "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //             "Name": "RegistrantName",
  //             "Value": unallocatedRegistrants[i].RegistrantName
  //           },
  //           {
  //             "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //             "Name": "SortOrder",
  //             "Value": {
  //               "$type": "System.Int32",
  //               "$value": 0
  //             }
  //           },
  //           {
  //             "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //             "Name": "TableID",
  //             "Value": {
  //               "$type": "System.Int32",
  //               "$value": this.advancedSessions[sessionIndex].tables.filter(ele => ele.Ordinal == this.advancedSessions[sessionIndex].tableOpened.Ordinal)[0].Ordinal
  //             }
  //           }]
  //         });
  //         if(this.envMode== '2017'){
  //           RegistrantsData[i].registrant.push(
  //             {
  //               "$type":"Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //               "Name":"ContactKey",
  //               "Value":this.selectedPartyId
  //             }
  //           )
  //       }
  //       }
  //       if (this.advancedSessions[sessionIndex].tables.filter(ele => ele.Ordinal == this.advancedSessions[sessionIndex].tableOpened.Ordinal)[0].remainingUnallocatedRegistrantsSeats == i + 1) {
  //         let increamentedValue = 0;
  //         RegistrantsData.map(ele => {
  //           this.seatallocationService.updateRegistrant(ele,this.selectedPartyId).subscribe(
  //             result => {
  //               increamentedValue = increamentedValue + 1;
  //               if (increamentedValue == RegistrantsData.length) {
  //                 this.seatallocationService.getRegistrants(this.eventID, this.advancedSessions[sessionIndex].Ordinal).subscribe(
  //                   result1 => {
  //                     let registrantsResult = [];
  //                     result1.map((ele1: any, index) => {
  //                       registrantsResult[index] = []
  //                       ele1.Properties.$values.map(ele1 => {
  //                         registrantsResult[index][ele1.Name] = typeof (ele1.Value) == 'object' ? ele1.Value.$value : ele1.Value;
  //                       })
  //                     })

  //                     let unallocatedRegistrantsLength = registrantsResult.filter(ele1 => ele1.TableID == 0);
  //                     let allocatedRegistrantsLength = registrantsResult.filter(ele1 => ele1.TableID != 0);

  //                     let sessionData = new Array();
  //                     if(this.envMode=='2017'){
  //                       sessionData.push({
  //                         "$type":"Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //                         "Name":"ContactKey",
  //                         "Value":this.selectedPartyId
  //                       })
  //                     }
  //                     sessionData.push({
  //                       "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //                       "Name": "Ordinal",
  //                       "Value": { "$type": "System.Int32", "$value": this.advancedSessions[sessionIndex].Ordinal }
  //                     })
  //                     sessionData.push({
  //                       "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //                       "Name": "TotalUnallocated",
  //                       "Value": { "$type": "System.Int32", "$value": unallocatedRegistrantsLength.length }
  //                     })
  //                     sessionData.push({
  //                       "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //                       "Name": "TotalAllocated",
  //                       "Value": { "$type": "System.Int32", "$value": allocatedRegistrantsLength.length }
  //                     })
  //                     sessionData.push({
  //                       "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //                       "Name": "TotalSeats",
  //                       "Value": { "$type": "System.Int32", "$value": this.advancedSessions[sessionIndex].TotalSeats }
  //                     })
  //                     sessionData.push({
  //                       "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //                       "Name": "TotalTables",
  //                       "Value": { "$type": "System.Int32", "$value": this.advancedSessions[sessionIndex].TotalTables }
  //                     })
  //                     sessionData.push({
  //                       "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //                       "Name": "Programs",
  //                       "Value": this.advancedSessions[sessionIndex].Programs.toString()
  //                     })
  //                     sessionData.push({
  //                       "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //                       "Name": "SessionName",
  //                       "Value": this.advancedSessions[sessionIndex].SessionName
  //                     })
  //                     sessionData.push({
  //                       "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //                       "Name": "EventID",
  //                       "Value": this.advancedSessions[sessionIndex].EventID
  //                     })
  //                     sessionData.push({
  //                       "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //                       "Name": "SessionTimeStamp",
  //                       "Value": this.advancedSessions[sessionIndex].SessionTimeStamp
  //                     })
                      
  //                     this.seatallocationService.updateSession({ sessionID: this.advancedSessions[sessionIndex].Ordinal, session: sessionData ,selectedPartyId: this.selectedPartyId}).subscribe(
  //                       result => {
  //                         this.toast.success("Auto Assign has been completed. Please wait while we are updating the records!!", "Success");
  //                         this.getPrograms();
  //                       }, error => {
  //                         this.toast.error("Something went wrong!! Please try again later!!", "Error");
  //                       }
  //                     )
  //                   }, error1 => {
  //                     this.toast.error("Something went wrong!! Please try again later!!", "Error");
  //                   }
  //                 )
  //               }
  //             }, error => {
  //               this.toast.error("Something went wrong!! Please try again later!!", "Error");
  //             }
  //           )
  //         })
  //       }
  //     }
  //   } else {
  //     this.isLoading = false;
  //   }
  // }

  

async autoAssignAllToTable(sessionIndex) {
  this.isLoading = true;

  const session = this.advancedSessions[sessionIndex];
  const table = session.tables.find(t => t.Ordinal === session.tableOpened.Ordinal);

  if (!table || table.remainingUnallocatedRegistrantsSeats <= 0) {
    this.isLoading = false;
    return;
  }

  const unallocatedRegistrants = session.unallocatedRegistrants;
  const RegistrantsData = [];

  for (let i = 0; i < table.remainingUnallocatedRegistrantsSeats && i < unallocatedRegistrants.length; i++) {
    const registrant = unallocatedRegistrants[i];
    const registrantProps = [
      { Name: "Ordinal", Value: { "$type": "System.Int32", "$value": registrant.Ordinal } },
      { Name: "SessionID", Value: { "$type": "System.Int32", "$value": registrant.SessionID } },
      { Name: "EventID", Value: registrant.EventID },
      { Name: "RegistrantID", Value: registrant.RegistrantID },
      { Name: "RegistrantName", Value: registrant.RegistrantName },
      { Name: "DisplayName", Value: registrant.DisplayName },
      { Name: "AccessibilityNote", Value: registrant.AccessibilityNote },
      { Name: "Accessibility", Value: registrant.Accessibility },
      { Name: "Dietary", Value: registrant.Dietary },
      { Name: "DietaryNote", Value: registrant.DietaryNote },
      { Name: "SortOrder", Value: { "$type": "System.Int32", "$value": 0 } },
      { Name: "TableID", Value: { "$type": "System.Int32", "$value": table.Ordinal } }
    ].map(p => ({ "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts", ...p }));

    if (this.envMode === '2017') {
      registrantProps.push({
        "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
        "Name": "ContactKey",
        "Value": this.selectedPartyId
      });
    }

    RegistrantsData.push({ registrantID: registrant.Ordinal, registrant: registrantProps });
  }

  try {
    for (const regData of RegistrantsData) {
      await firstValueFrom(this.seatallocationService.updateRegistrant(regData, this.selectedPartyId));
    }

    const result1: any = await firstValueFrom(this.seatallocationService.getRegistrants(this.eventID, session.Ordinal));

    const registrantsResult = result1.map((ele: any) => {
      const obj = {};
      ele.Properties.$values.forEach(prop => {
        obj[prop.Name] = typeof prop.Value === 'object' ? prop.Value.$value : prop.Value;
      });
      return obj;
    });


    

    const unallocatedCount = registrantsResult.filter(r => r.TableID == 0).length;
    const allocatedCount = registrantsResult.filter(r => r.TableID != 0).length;

    const sessionData = [];

    if (this.envMode === '2017') {
      sessionData.push({
        "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
        "Name": "ContactKey",
        "Value": this.selectedPartyId
      });
    }

    [
      { Name: "Ordinal", Value: { "$type": "System.Int32", "$value": session.Ordinal } },
      { Name: "TotalUnallocated", Value: { "$type": "System.Int32", "$value": unallocatedCount } },
      { Name: "TotalAllocated", Value: { "$type": "System.Int32", "$value": allocatedCount } },
      { Name: "TotalSeats", Value: { "$type": "System.Int32", "$value": session.TotalSeats } },
      { Name: "TotalTables", Value: { "$type": "System.Int32", "$value": session.TotalTables } },
      { Name: "Programs", Value: session.Programs.toString() },
      { Name: "SessionName", Value: session.SessionName },
      { Name: "EventID", Value: session.EventID },
      { Name: "SessionTimeStamp", Value: session.SessionTimeStamp }
    ].forEach(p => {
      sessionData.push({
        "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
        ...p
      });
    });

    await firstValueFrom(this.seatallocationService.updateSession({
      sessionID: session.Ordinal,
      session: sessionData,
      selectedPartyId: this.selectedPartyId
    }));

    this.toast.success("Auto Assign has been completed. Please wait while we are updating the records!!", "Success");
    this.getPrograms();

  } catch (err) {
    console.error(err);
    this.toast.error("Something went wrong!! Please try again later!!", "Error");
  } finally {
    this.isLoading = false;
  }
}


  // manual assign the registrants to the selected table

  

  async manualAssignAllToTable(sessionIndex: number) {
    this.isLoading = true;
  
    try {
      const session = this.advancedSessions[sessionIndex];
      const openedTable = session.tables.find(t => t.Ordinal === session.tableOpened.Ordinal);
  
      if (!openedTable || openedTable.remainingUnallocatedRegistrantsSeats <= 0) return;
  
      const unallocatedRegistrants = session.unallocatedRegistrants.filter(r => r.multiSelect);
      const RegistrantsData = [];
  
      for (let i = 0; i < openedTable.remainingUnallocatedRegistrantsSeats && i < unallocatedRegistrants.length; i++) {
        const registrant = unallocatedRegistrants[i];
        const props = [
          this.createProp("Ordinal", { "$type": "System.Int32", "$value": registrant.Ordinal }),
          this.createProp("SessionID", { "$type": "System.Int32", "$value": registrant.SessionID }),
          this.createProp("EventID", registrant.EventID),
          this.createProp("RegistrantID", registrant.RegistrantID),
          this.createProp("RegistrantName", registrant.RegistrantName),
          this.createProp("DisplayName", registrant.DisplayName),
          this.createProp("AccessibilityNote", registrant.AccessibilityNote),
          this.createProp("Accessibility", registrant.Accessibility),
          this.createProp("Dietary", registrant.Dietary),
          this.createProp("DietaryNote", registrant.DietaryNote),
          this.createProp("SortOrder", { "$type": "System.Int32", "$value": 0 }),
          this.createProp("TableID", { "$type": "System.Int32", "$value": openedTable.Ordinal })
        ];
  
        if (this.envMode === '2017') {
          props.push(this.createProp("ContactKey", this.selectedPartyId));
        }
  
        RegistrantsData.push({ registrantID: registrant.Ordinal, registrant: props });
      }
  
      // Update all registrants
      for (const reg of RegistrantsData) {
        await firstValueFrom(this.seatallocationService.updateRegistrant(reg, this.selectedPartyId));
      }
  
      // Fetch updated registrants
      const result1: any = await firstValueFrom(this.seatallocationService.getRegistrants(this.eventID, session.Ordinal));
      const registrantsResult = result1.map((ele: any) => {
        const r: any = [];
        ele.Properties.$values.forEach((prop: any) => {
          r[prop.Name] = typeof prop.Value === 'object' ? prop.Value.$value : prop.Value;
        });
        return r;
      });
  
      // Prepare session update data
      const unallocated = registrantsResult.filter(r => r.TableID == 0);
      const allocated = registrantsResult.filter(r => r.TableID != 0);
  
      const sessionData: any[] = [];
      if (this.envMode === '2017') {
        sessionData.push(this.createProp("ContactKey", this.selectedPartyId));
      }
  
      sessionData.push(this.createProp("Ordinal", { "$type": "System.Int32", "$value": session.Ordinal }));
      sessionData.push(this.createProp("TotalUnallocated", { "$type": "System.Int32", "$value": unallocated.length }));
      sessionData.push(this.createProp("TotalAllocated", { "$type": "System.Int32", "$value": allocated.length }));
      sessionData.push(this.createProp("TotalSeats", { "$type": "System.Int32", "$value": session.TotalSeats }));
      sessionData.push(this.createProp("TotalTables", { "$type": "System.Int32", "$value": session.TotalTables }));
      sessionData.push(this.createProp("Programs", session.Programs.toString()));
      sessionData.push(this.createProp("SessionName", session.SessionName));
      sessionData.push(this.createProp("EventID", session.EventID));
      sessionData.push(this.createProp("SessionTimeStamp", session.SessionTimeStamp));
  
      await firstValueFrom(this.seatallocationService.updateSession({
        sessionID: session.Ordinal,
        session: sessionData,
        selectedPartyId: this.selectedPartyId
      }));
  
      this.toast.success("Manual Assign has been completed. Please wait while we are updating the records!!", "Success");
      this.getPrograms();
  
    } catch (error) {
      this.toast.error("Something went wrong!! Please try again later!!", "Error");
    } finally {
      this.isLoading = false;
    }
  }
  
  private createProp(name: string, value: any) {
    return {
      "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
      "Name": name,
      "Value": value
    };
  }
  


  // async manualAssignAllToTable(sessionIndex) {
  //   this.isLoading = true;
  //   if (this.advancedSessions[sessionIndex].tables.filter(ele => ele.Ordinal == this.advancedSessions[sessionIndex].tableOpened.Ordinal)[0].remainingUnallocatedRegistrantsSeats > 0) {
  //     let unallocatedRegistrants = this.advancedSessions[sessionIndex].unallocatedRegistrants.filter(ele => ele.multiSelect);
  //     let RegistrantsData = [];

  //     for (let i = 0; i < this.advancedSessions[sessionIndex].tables.filter(ele => ele.Ordinal == this.advancedSessions[sessionIndex].tableOpened.Ordinal)[0].remainingUnallocatedRegistrantsSeats; i++) {
  //       if (unallocatedRegistrants.length > i) {
  //         RegistrantsData.push({
  //           registrantID: unallocatedRegistrants[i].Ordinal,
  //           registrant: [{
  //             "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //             "Name": "Ordinal",
  //             "Value": {
  //               "$type": "System.Int32",
  //               "$value": unallocatedRegistrants[i].Ordinal
  //             }
  //           },
  //           {
  //             "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //             "Name": "SessionID",
  //             "Value": {
  //               "$type": "System.Int32",
  //               "$value": unallocatedRegistrants[i].SessionID
  //             }
  //           },
  //           {
  //             "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //             "Name": "EventID",
  //             "Value": unallocatedRegistrants[i].EventID
  //           },
  //           {
  //             "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //             "Name": "RegistrantID",
  //             "Value": unallocatedRegistrants[i].RegistrantID
  //           },
  //           {
  //             "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //             "Name": "RegistrantName",
  //             "Value": unallocatedRegistrants[i].RegistrantName
  //           },
  //           {
  //             "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //             "Name": "DisplayName",
  //             "Value": unallocatedRegistrants[i].DisplayName
  //           },
  //           {
  //             "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //             "Name": "AccessibilityNote",
  //             "Value": unallocatedRegistrants[i].AccessibilityNote
  //           },
  //           {
  //             "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //             "Name": "Accessibility",
  //             "Value": unallocatedRegistrants[i].Accessibility
  //           },
  //           {
  //             "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //             "Name": "Dietary",
  //             "Value": unallocatedRegistrants[i].Dietary
  //           },
  //           {
  //             "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //             "Name": "DietaryNote",
  //             "Value": unallocatedRegistrants[i].DietaryNote
  //           },
  //           {
  //             "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //             "Name": "SortOrder",
  //             "Value": {
  //               "$type": "System.Int32",
  //               "$value": 0
  //             }
  //           },
  //           {
  //             "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //             "Name": "TableID",
  //             "Value": {
  //               "$type": "System.Int32",
  //               "$value": this.advancedSessions[sessionIndex].tables.filter(ele => ele.Ordinal == this.advancedSessions[sessionIndex].tableOpened.Ordinal)[0].Ordinal
  //             }
  //           }]
  //         });
  //         if(this.envMode== '2017'){
  //           RegistrantsData[i].registrant.push(
  //             {
  //               "$type":"Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //               "Name":"ContactKey",
  //               "Value":this.selectedPartyId
  //             }
  //           )
  //       }
  //       }
  //       if (this.advancedSessions[sessionIndex].tables.filter(ele => ele.Ordinal == this.advancedSessions[sessionIndex].tableOpened.Ordinal)[0].remainingUnallocatedRegistrantsSeats == i + 1) {
  //         let increamentedValue = 0;
  //         RegistrantsData.map(ele => {
  //           this.seatallocationService.updateRegistrant(ele,this.selectedPartyId).subscribe(
  //             result => {
  //               increamentedValue = increamentedValue + 1;
  //               if (increamentedValue == RegistrantsData.length) {
  //                 this.seatallocationService.getRegistrants(this.eventID, this.advancedSessions[sessionIndex].Ordinal).subscribe(
  //                   result1 => {
  //                     let registrantsResult = [];
  //                     result1.map((ele1: any, index) => {
  //                       registrantsResult[index] = []
  //                       ele1.Properties.$values.map(ele1 => {
  //                         registrantsResult[index][ele1.Name] = typeof (ele1.Value) == 'object' ? ele1.Value.$value : ele1.Value;
  //                       })
  //                     })

  //                     let unallocatedRegistrantsLength = registrantsResult.filter(ele1 => ele1.TableID == 0);
  //                     let allocatedRegistrantsLength = registrantsResult.filter(ele1 => ele1.TableID != 0);

  //                     let sessionData = new Array();
  //                     if(this.envMode=='2017'){
  //                       sessionData.push({
  //                         "$type":"Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //                         "Name":"ContactKey",
  //                         "Value":this.selectedPartyId
  //                       })
  //                     }
  //                     sessionData.push({
  //                       "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //                       "Name": "Ordinal",
  //                       "Value": { "$type": "System.Int32", "$value": this.advancedSessions[sessionIndex].Ordinal }
  //                     })
  //                     sessionData.push({
  //                       "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //                       "Name": "TotalUnallocated",
  //                       "Value": { "$type": "System.Int32", "$value": unallocatedRegistrantsLength.length }
  //                     })
  //                     sessionData.push({
  //                       "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //                       "Name": "TotalAllocated",
  //                       "Value": { "$type": "System.Int32", "$value": allocatedRegistrantsLength.length }
  //                     })
  //                     sessionData.push({
  //                       "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //                       "Name": "TotalSeats",
  //                       "Value": { "$type": "System.Int32", "$value": this.advancedSessions[sessionIndex].TotalSeats }
  //                     })
  //                     sessionData.push({
  //                       "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //                       "Name": "TotalTables",
  //                       "Value": { "$type": "System.Int32", "$value": this.advancedSessions[sessionIndex].TotalTables }
  //                     })
  //                     sessionData.push({
  //                       "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //                       "Name": "Programs",
  //                       "Value": this.advancedSessions[sessionIndex].Programs.toString()
  //                     })
  //                     sessionData.push({
  //                       "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //                       "Name": "SessionName",
  //                       "Value": this.advancedSessions[sessionIndex].SessionName
  //                     })
  //                     sessionData.push({
  //                       "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //                       "Name": "EventID",
  //                       "Value": this.advancedSessions[sessionIndex].EventID
  //                     })
  //                     sessionData.push({
  //                       "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //                       "Name": "SessionTimeStamp",
  //                       "Value": this.advancedSessions[sessionIndex].SessionTimeStamp
  //                     })
                      
  //                     this.seatallocationService.updateSession({ sessionID: this.advancedSessions[sessionIndex].Ordinal, session: sessionData,selectedPartyId: this.selectedPartyId }).subscribe(
  //                       result => {
  //                         this.toast.success("Manual Assign has been completed. Please wait while we are updating the records!!", "Success");
  //                         this.getPrograms();
  //                       }, error => {
  //                         this.toast.error("Something went wrong!! Please try again later!!", "Error");
  //                       }
  //                     )
  //                   }, error1 => {
  //                     this.toast.error("Something went wrong!! Please try again later!!", "Error");
  //                   }
  //                 )
  //               }
  //             }, error => {
  //               this.toast.error("Something went wrong!! Please try again later!!", "Error");
  //             }
  //           )
  //         })
  //       }
  //     }
  //   } else {
  //     this.isLoading = false;
  //   }
  // }

  // unallocated registrant from table
  async deleteRegistrantFromTable(sessionIndex, innerTableInner) {
    
    this.isLoading = true;
    if (innerTableInner) {
      let registrantData = [{
        "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
        "Name": "Ordinal",
        "Value": {
          "$type": "System.Int32",
          "$value": innerTableInner.Ordinal
        }
      },
      {
        "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
        "Name": "SessionID",
        "Value": {
          "$type": "System.Int32",
          "$value": innerTableInner.SessionID
        }
      },
      {
        "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
        "Name": "EventID",
        "Value": innerTableInner.EventID
      },
      {
        "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
        "Name": "RegistrantID",
        "Value": innerTableInner.RegistrantID
      },
      {
        "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
        "Name": "RegistrantName",
        "Value": innerTableInner.RegistrantName
      },
      {
        "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
        "Name": "DisplayName",
        "Value": innerTableInner.DisplayName
      },
      {
        "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
        "Name": "AccessibilityNote",
        "Value": innerTableInner.AccessibilityNote
      },
      {
        "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
        "Name": "Accessibility",
        "Value": innerTableInner.Accessibility
      },
      {
        "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
        "Name": "Dietary",
        "Value": innerTableInner.Dietary
      },
      {
        "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
        "Name": "DietaryNote",
        "Value": innerTableInner.DietaryNote
      },
      {
        "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
        "Name": "SortOrder",
        "Value": {
          "$type": "System.Int32",
          "$value": 0
        }
      },
      {
        "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
        "Name": "TableID",
        "Value": {
          "$type": "System.Int32",
          "$value": 0
        }
      }]

      if(this.envMode== '2017'){
        registrantData.push(
          {
            "$type":"Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
            "Name":"ContactKey",
            "Value":this.selectedPartyId
          }
        )
    }

      this.seatallocationService.updateRegistrant({ registrantID: innerTableInner.Ordinal, registrant: registrantData },this.selectedPartyId).subscribe(
        result => {
          let sessionData = new Array();
          if(this.envMode=='2017'){
            sessionData.push({
              "$type":"Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
              "Name":"ContactKey",
              "Value":this.selectedPartyId
            })
          }
          sessionData.push({
            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
            "Name": "Ordinal",
            "Value": { "$type": "System.Int32", "$value": this.advancedSessions[sessionIndex].Ordinal }
          })
          sessionData.push({
            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
            "Name": "TotalUnallocated",
            "Value": { "$type": "System.Int32", "$value": this.advancedSessions[sessionIndex].TotalUnallocated + 1 }
          })
          sessionData.push({
            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
            "Name": "TotalAllocated",
            "Value": { "$type": "System.Int32", "$value": this.advancedSessions[sessionIndex].TotalAllocated - 1 }
          })
          sessionData.push({
            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
            "Name": "TotalSeats",
            "Value": { "$type": "System.Int32", "$value": this.advancedSessions[sessionIndex].TotalSeats }
          })
          sessionData.push({
            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
            "Name": "TotalTables",
            "Value": { "$type": "System.Int32", "$value": this.advancedSessions[sessionIndex].TotalTables }
          })
          sessionData.push({
            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
            "Name": "Programs",
            "Value": this.advancedSessions[sessionIndex].Programs.toString()
          })
          sessionData.push({
            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
            "Name": "SessionName",
            "Value": this.advancedSessions[sessionIndex].SessionName
          })
          sessionData.push({
            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
            "Name": "EventID",
            "Value": this.advancedSessions[sessionIndex].EventID
          })
          sessionData.push({
            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
            "Name": "SessionTimeStamp",
            "Value": this.advancedSessions[sessionIndex].SessionTimeStamp
          })

          this.seatallocationService.updateSession({ sessionID: this.advancedSessions[sessionIndex].Ordinal, session: sessionData ,selectedPartyId: this.selectedPartyId}).subscribe(
            result1 => {
              this.toast.success("Registrant deleted successfully!!. Please wait while we are updating the records!!", "Success");
              this.getPrograms();
            }, error1 => {
              this.toast.error("Something went wrong!! Please try again later!!", "Error");
            }
          )
        }, error => {
          this.toast.error("Something went wrong!! Please try again later!!", "Error");
        }
      )
    } else {
      this.isLoading = false;
    }
  }

  // rearrange the table's registrants
  drop(event: CdkDragDrop<string[]>, sessionIndex, tableIndex) {
    this.isLoading = true;
    moveItemInArray(this.advancedSessions[sessionIndex].tables[tableIndex].tablesAllocatedRegistrants, event.previousIndex, event.currentIndex);
    let RegistrantsData = [];
    this.advancedSessions[sessionIndex].tables[tableIndex].tablesAllocatedRegistrants.map((ele, index) => {
      RegistrantsData.push({
        registrantID: ele.Ordinal,
        registrant: [{
          "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
          "Name": "Ordinal",
          "Value": {
            "$type": "System.Int32",
            "$value": ele.Ordinal
          }
        },
        {
          "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
          "Name": "SessionID",
          "Value": {
            "$type": "System.Int32",
            "$value": ele.SessionID
          }
        },
        {
          "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
          "Name": "EventID",
          "Value": ele.EventID
        },
        {
          "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
          "Name": "RegistrantID",
          "Value": ele.RegistrantID
        },
        {
          "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
          "Name": "RegistrantName",
          "Value": ele.RegistrantName
        },
        {
          "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
          "Name": "SortOrder",
          "Value": {
            "$type": "System.Int32",
            "$value": index + 1
          }
        },
        {
          "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
          "Name": "TableID",
          "Value": {
            "$type": "System.Int32",
            "$value": ele.TableID
          }
        }]
      });
      if(this.envMode== '2017'){
        RegistrantsData[index].registrant.push(
          {
            "$type":"Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
            "Name":"ContactKey",
            "Value":this.selectedPartyId
          }
        )
    }
      if (this.advancedSessions[sessionIndex].tables[tableIndex].tablesAllocatedRegistrants.length == index + 1) {
        let increamentedValue = 0;
        RegistrantsData.map(ele1 => {
          this.seatallocationService.updateRegistrant(ele1,this.selectedPartyId).subscribe(
            result => {
              increamentedValue = increamentedValue + 1;
              if (increamentedValue == RegistrantsData.length) {
                this.isLoading = false;
              }
            })
        })
      }
    })
  }

  // open the print url in new tab
  openNewTab(sessionIndex) {
    window.open(`/staff/SeatAllocationReport?Event Code=${this.advancedSessions[sessionIndex].EventID}&SessionID=${this.advancedSessions[sessionIndex].Ordinal}`, "_blank");
  }


  async refreshBtn(ele){
    
    








this.isLoading=true



    
      
      
        let programNamesWithQuotes = '"' + ele.Programs.join('","') + '"';

        try {
          let programNamesTableWithQuotes = await this.getTableFunctions();
          if (programNamesTableWithQuotes) {
            const array1 = (programNamesTableWithQuotes as string).replace(/"/g, "").split(",");
            const array2 = programNamesWithQuotes.replace(/"/g, "").split(",");
            
            const insideTable = array2.filter(item => array1.includes(item));
            const outsideTable = array2.filter(item => !array1.includes(item));

            
            
            

            let RegistrantsDetails = [];
      
            if (insideTable.length) {
              let result = await this.seatallocationService.getIQARegistrantsTableGuest('"' + insideTable.join('","') + '"').toPromise();
              if (result.length > 0) {
                result = result.filter((thing, index, self) =>
                  index === self.findIndex(t => 
                    (t.Properties as any).$values.find(ele1 => ele1.Name === 'GuestID').Value ===
                    (thing.Properties as any).$values.find(ele1 => ele1.Name === 'GuestID').Value
                  )
                );
    
                for (const val of result) {
                  RegistrantsDetails.push(this.createRegistrantDataRefresh(ele,val));
                }
              }
            }
    
            if (outsideTable.length) {
              let result2 = await this.seatallocationService.getIQARegistrants('"' + outsideTable.join('","') + '"').toPromise();
              if (result2.length > 0) {
                result2 = result2.filter((thing, index, self) =>
                  index === self.findIndex(t => 
                    (t.Properties as any).$values.find(ele1 => ele1.Name === 'RegistrantID').Value ===
                    (thing.Properties as any).$values.find(ele1 => ele1.Name === 'RegistrantID').Value
                  )
                );
    
                for (const val of result2) {
                  RegistrantsDetails.push(this.createRegistrantDataRefresh(ele,val));
                }
              }
            }


            

            let oldArr= ele.allRegistrants
            let newArr= RegistrantsDetails

            interface RegistrantProperties {
              SessionID: number;
              EventID: string | null;
              RegistrantID: string;
              RegistrantName: string;
              AccessibilityNote: string | null;
              Accessibility: string | null;
              Dietary: string | null;
              DietaryNote: string | null;
              DisplayName: string;
              SortOrder: number;
              TableID: number;
              ContactKey: string;
            }
            
            const extractProperties = (item: any): RegistrantProperties => {
              const props: any = {};
              item.Properties["$values"].forEach((prop: any) => {
                props[prop.Name] = prop.Value && prop.Value.$value !== undefined ? prop.Value.$value : prop.Value;
              });
              return props as RegistrantProperties;
            };
            
            // Now continue same as before...
            const oldRegistrantIDs = oldArr.map(item => item.RegistrantID);
            const newRegistrantData = newArr.map(extractProperties);
            const newRegistrantIDs = newRegistrantData.map(item => item.RegistrantID);
            
            
            // Inserted
            const inserted = newRegistrantData.filter(item => !oldRegistrantIDs.includes(item.RegistrantID));
            
            // Deleted
            const deleted = oldArr.filter(item => !newRegistrantIDs.includes(item.RegistrantID));
            
            // Updated
            const updated = [];
            oldArr.forEach(oldItem => {
              const matchingNew = newRegistrantData.find(newItem => newItem.RegistrantID === oldItem.RegistrantID);
              if (matchingNew) {
              


                if (
                  oldItem.DisplayName != matchingNew.DisplayName ||
                  oldItem.Accessibility != matchingNew.Accessibility ||
                  oldItem.AccessibilityNote != matchingNew.AccessibilityNote ||
                  oldItem.Dietary != matchingNew.Dietary ||
                  oldItem.DietaryNote != matchingNew.DietaryNote 
                  
                ) {
                  updated.push({
                    old: oldItem,
                    new: matchingNew
                  });
                }
              }
            });
            
            // console.log(inserted)
            // console.log(updated)
            // console.log(deleted)

            

            if(inserted && inserted.length){
             await this.insertDataSequentially(inserted)
            }
            if(updated && updated.length){
             await this.updateDataSequentially(updated)
            }
            if(deleted && deleted.length){
             await this.deleteDataSequentially(deleted)
            }


            
            
            

         let totalUnallocated=    ele.TotalUnallocated - deleted.length + inserted.length + updated.filter(item => item.old.TableID && item.old.TableID != "0").length;
let totalallocated = ele.TotalAllocated - updated.filter(item => item.old.TableID && item.old.TableID != "0").length




            

            let sessionData = new Array();

            if(this.envMode=='2017'){
              sessionData.push({
                "$type":"Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                "Name":"ContactKey",
                "Value":this.selectedPartyId
              })
            }
            sessionData.push({
              "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
              "Name": "Ordinal",
              "Value": { "$type": "System.Int32", "$value": ele.Ordinal}
            })
            sessionData.push({
              "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
              "Name": "TotalUnallocated",
              "Value": { "$type": "System.Int32", "$value": totalUnallocated }
            })
            sessionData.push({
              "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
              "Name": "TotalAllocated",
              "Value": { "$type": "System.Int32", "$value": totalallocated}
            })
            sessionData.push({
              "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
              "Name": "TotalSeats",
              "Value": { "$type": "System.Int32", "$value": ele.TotalSeats }
            })
            sessionData.push({
              "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
              "Name": "TotalTables",
              "Value": { "$type": "System.Int32", "$value": ele.TotalTables }
            })
            sessionData.push({
              "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
              "Name": "Programs",
              "Value": ele.Programs.join(",") 
            })
            sessionData.push({
              "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
              "Name": "SessionName",
              "Value": ele.SessionName
            })
            sessionData.push({
              "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
              "Name": "EventID",
              "Value": ele.EventID
            })
            sessionData.push({
              "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
              "Name": "SessionTimeStamp",
              "Value": ele.SessionTimeStamp
            })


            
            
            this.seatallocationService.updateSession({ sessionID: ele.Ordinal, session: sessionData ,selectedPartyId: this.selectedPartyId}).subscribe(
              result => {
                this.getPrograms();
                
              }, error => {
                this.toast.error("Something went wrong!! Please try again later!!", "Error");
              }
            )













           
           
          
      
      // this.getPrograms();
          }
           
        }catch (error) {
          console.error("Error occurred:", error);
        } finally {
          this.isLoading = false;
        }
  



      

    

//     this.seatallocationService.getRegistrants(this.eventID, ele.Ordinal).subscribe(
//       result => {
//         let registrantsResult = [];
//         if (result.length > 0) {
          
//           result.forEach((ele1: any, index1) => {
//             const obj: any = {};
//             ele1.Properties.$values.forEach((prop: any) => {
//               obj[prop.Name] = typeof prop.Value === 'object' ? prop.Value.$value : prop.Value;
//             });
//             registrantsResult.push(obj);
//           });
          
          
//           // result.map((ele1: any, index1) => {
//           //   registrantsResult[index1] = []
//           //   ele1.Properties.$values.map(ele1 => {
//           //     registrantsResult[index1][ele1.Name] = typeof (ele1.Value) == 'object' ? ele1.Value.$value : ele1.Value;
//           //   })
//           // })
//           // registrantsResult = registrantsResult.sort((a, b) => parseInt(a.SortOrder) - parseInt(b.SortOrder));
//           // ele['allRegistrants'] = [];
//           // ele['allRegistrants'] = registrantsResult;

          
//           // registrantsResult.shift()
//           console.log(registrantsResult.pop() )

//           registrantsResult.push({
//             "SessionID": 4,
//             "EventID": "Table_Test",
//             "RegistrantID": "51024-3",
//             "RegistrantName": "dsfsd dsf test",
//             "SortOrder": 0,
//             "TableID": "0",
//             "ContactKey": "194",
//             "Ordinal": 277,
//             "DisplayName": "hello"
//         })

//         registrantsResult[1]={
//           "SessionID": 4,
//           "EventID": "Table_Test",
//           "RegistrantID": "51024-1",
//           "RegistrantName": "John Do DispalyName",
//           "SortOrder": 0,
//           "TableID": "0",
//           "ContactKey": "194",
//           "Ordinal": 276,
//           "DisplayName": ""
//       }

//           console.log(registrantsResult)
//           let newArray = registrantsResult
//           let oldArray = this.advancedSessions[0].allRegistrants




//           const inserted = newArray.filter(newItem =>
//             !oldArray.some(oldItem => oldItem.RegistrantID === newItem.RegistrantID)
//           );
          

//           const deleted = oldArray.filter(oldItem =>
          
//             !newArray.some(newItem => 
              
//               newItem.RegistrantID === oldItem.RegistrantID)
//           );

//           const updated = newArray.filter(newItem => {
//             const match = oldArray.find(oldItem => oldItem.RegistrantID === newItem.RegistrantID);
//             return match && JSON.stringify(match) !== JSON.stringify(newItem);
//           });


//           console.log('inserted',inserted)
//           console.log('Deleted',deleted)
//           console.log('updated',updated)
          

// //           const results = this.compareArrays(this.advancedSessions[0].allRegistrants, registrantsResult);
// // console.log(results);



          
//         }
//       })

    
  }


  

async insertDataSequentially(items: any[]) {
  this.isLoading=true
  const total = items.length;

  for (let i = 0; i < total; i++) {
    const item = items[i];
    

    try {


let tempData = {
  "$type": "Asi.Soa.Core.DataContracts.GenericEntityData, Asi.Contracts",
  "EntityTypeName": this.envMode === '2017' ? 'Psc_Event_Registrant_2017' : 'Psc_Event_Registrant',
  "Properties": {
    "$type": "Asi.Soa.Core.DataContracts.GenericPropertyDataCollection, Asi.Contracts",
    "$values": [
      { "Name": "SessionID", "Value": item.SessionID },
      { "Name": "EventID", "Value": item.EventID },
      { "Name": "RegistrantID", "Value": item.RegistrantID },
      { "Name": "RegistrantName", "Value": item.RegistrantName },
      { "Name": "AccessibilityNote", "Value": item.AccessibilityNote },
      { "Name": "Accessibility", "Value": item.Accessibility },
      { "Name": "Dietary", "Value": item.Dietary },
      { "Name": "DietaryNote", "Value": item.DietaryNote },
      { "Name": "DisplayName", "Value": item.DisplayName ? item.DisplayName : item.RegistrantName },
      { "Name": "SortOrder", "Value": { "$type": "System.Int32", "$value": 0 } },
      { "Name": "TableID", "Value": { "$type": "System.Int32", "$value": 0 } }
    ]
  }
};

if (this.envMode === '2017') {
  tempData.Properties.$values.push({
    "$type": `Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts`,
    "Name": "ContactKey",
    "Value": this.selectedPartyId
  }as any);
  if(!this.selectedPartyId){
    
  }
}



      const response = await lastValueFrom(this.seatallocationService.addRegistrant(tempData));
      this.isLoading=true
      
      

      const percentage = Math.round(((i + 1) / total) * 100);
      this.progressPercentage=percentage
      
    } catch (error) {
      console.error(`Error inserting item ${i + 1}:`, error);
    }
  }

  
  this.isLoading=false
}
async updateDataSequentially(items: any[]) {
  this.isLoading=true
  const total = items.length;

  for (let i = 0; i < total; i++) {
    const item = items[i].new;
    const Ordinal = items[i].old.Ordinal

    try {


      let registrantData = [{
        "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
        "Name": "Ordinal",
        "Value": {
          "$type": "System.Int32",
          "$value": Ordinal
        }
      },
      {
        "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
        "Name": "SessionID",
        "Value": {
          "$type": "System.Int32",
          "$value": item.SessionID
        }
      },
      {
        "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
        "Name": "EventID",
        "Value": item.EventID
      },
      {
        "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
        "Name": "RegistrantID",
        "Value": item.RegistrantID
      },
      {
        "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
        "Name": "Accessibility",
        "Value": item.Accessibility
      },
      {
        "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
        "Name": "RegistrantName",
        "Value": item.RegistrantName
      },
      {
        "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
        "Name": "DisplayName",
        "Value": item.DisplayName
      },
      {
        "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
        "Name": "AccessibilityNote",
        "Value": item.AccessibilityNote
      },
      {
        "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
        "Name": "Dietary",
        "Value": item.Dietary
      },
      {
        "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
        "Name": "DietaryNote",
        "Value": item.DietaryNote
      },
      {
        "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
        "Name": "SortOrder",
        "Value": {
          "$type": "System.Int32",
          "$value": 0
        }
      },
      {
        "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
        "Name": "TableID",
        "Value": {
          "$type": "System.Int32",
          "$value": 0
        }
      }]

      if(this.envMode== '2017'){
        registrantData.push(
          {
            "$type":"Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
            "Name":"ContactKey",
            "Value":this.selectedPartyId
          }
        )
    }

    
// return false

      const response = await lastValueFrom(this.seatallocationService.updateRegistrant({ registrantID: Ordinal, registrant: registrantData },this.selectedPartyId));
      this.isLoading=true
      
      

      const percentage = Math.round(((i + 1) / total) * 100);
      this.progressPercentage=percentage
      
    } catch (error) {
      console.error(`Error inserting item ${i + 1}:`, error);
    }
  }

  
  this.isLoading=false
}


async deleteDataSequentially(items: any[]) {
  this.isLoading=true
  const total = items.length;

  for (let i = 0; i < total; i++) {
    const item = items[i].Ordinal;

    try {


      
      const response = await lastValueFrom(this.seatallocationService.deleteRegistrant(item,this.selectedPartyId));
      this.isLoading=true
      // console.log(response)
      

      const percentage = Math.round(((i + 1) / total) * 100);
      this.progressPercentage=percentage
     
    } catch (error) {
      console.error(`Error inserting item ${i + 1}:`, error);
    }
  }

  
  this.isLoading=false
}



  createRegistrantDataRefresh(ele,val) {
    
    let properties = Array.isArray(val.Properties?.$values) ? val.Properties.$values : [];
    

    
    let RegistrantID = properties.find(ele1 => ele1.Name === 'GuestID' || ele1.Name === 'RegistrantID')?.Value || '';
    let Ordinal = properties.find(ele1 => ele1.Name === 'Ordinal')?.Value || '';
    let FullName = properties.find(ele1 => ele1.Name === 'FullName')?.Value || '';
    let DisplayName = properties.find(ele1 => ele1.Name === 'DisplayName')?.Value || '';
    let AccessibilityNote = properties.find(ele1 => ele1.Name === 'AccessibilityNote')?.Value || '';
    let Accessibility = properties.find(ele1 => ele1.Name === 'Accessibility')?.Value || '';
    let Dietary = properties.find(ele1 => ele1.Name === 'Dietary')?.Value || '';
    let DietaryNote = properties.find(ele1 => ele1.Name === 'DietaryNote')?.Value || '';
    let SessionID = ele.Ordinal || 0;
    let EventID = ele.EventID || '';
  
    let tempData = {
      "$type": "Asi.Soa.Core.DataContracts.GenericEntityData, Asi.Contracts",
      "EntityTypeName": this.envMode === '2017' ? 'Psc_Event_Registrant_2017' : 'Psc_Event_Registrant',
      "Properties": {
        "$type": "Asi.Soa.Core.DataContracts.GenericPropertyDataCollection, Asi.Contracts",
        "$values": [
          
          { "Name": "SessionID", "Value": SessionID },
          { "Name": "EventID", "Value": EventID },
          { "Name": "RegistrantID", "Value": RegistrantID },
          { "Name": "RegistrantName", "Value": FullName },
          { "Name": "AccessibilityNote", "Value": AccessibilityNote },
          { "Name": "Accessibility", "Value": Accessibility },
          { "Name": "Dietary", "Value": Dietary },
          { "Name": "DietaryNote", "Value": DietaryNote },
          { "Name": "DisplayName", "Value": DisplayName ? DisplayName : FullName },
          { "Name": "SortOrder", "Value": { "$type": "System.Int32", "$value": 0 } },
          { "Name": "TableID", "Value": { "$type": "System.Int32", "$value": 0 } }
        ]
      }
    };
  
    
    if(Ordinal){
      tempData.Properties.$values.push({
        "$type": `Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts`,
        "Name": "Ordinal",
        "Value": Ordinal
      }as any)
    }

    if (this.envMode === '2017') {
      tempData.Properties.$values.push({
        "$type": `Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts`,
        "Name": "ContactKey",
        "Value": this.selectedPartyId
      }as any);
      if(!this.selectedPartyId){
        
      }
    }
  
    
    
  
    return tempData;
  }

  
  
  


}

@Component({
  selector: 'session-dialog.component',
  templateUrl: 'session-dialog.component.html',
  styleUrls: ['./seat-allocation.component.scss']
})
export class SessionDialogComponent {
  envMode='2017'
  faExclamationTriangle = faExclamationTriangle;
  faCaretRight = faCaretRight;
  selectedPartyId= ''
  dropdownSettings = {
    singleSelection: false,
    idField: 'EventFunctionId',
    textField: 'Name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 5,
    allowSearchFilter: true
  };
  SessionName: string = '';
  sessionPrograms = [];
  errorMessage: boolean = false;
  isLoading: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<SessionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private matSnackBar: MatSnackBar,
    private toast: ToastrService,
    private seatallocationService: SeatallocationService) {
      if(this.envMode== '2017'){
      this.selectedPartyId= this.seatallocationService.selectedPartyIdIQA
      
      }
    this.sessionPrograms = [];
    

    if (this.data.session) {
      this.SessionName = this.data.session.SessionName;
      this.data.session.Programs.map(ele => {
        let program = this.data.programs.filter(ele1 => ele1.EventFunctionId == ele.trim())
        this.sessionPrograms.push(program[0]);
      })
    }
  }

  // close the dialog box
  onClose() {
    this.dialogRef.close({
      type: 'close'
    });
  }

  // save the session
  async saveSession() {
    if (!this.SessionName || this.sessionPrograms.length == 0) {
      this.errorMessage = true;
      return;
    }
    this.isLoading = true;
    this.errorMessage = false;
    let filteredPrograms = new Array();
    this.sessionPrograms.map(ele => {
      filteredPrograms.push(ele.EventFunctionId);
    })
    let sessionData = new Array();
    if (this.data.session) {

      sessionData.push({
        "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
        "Name": "Ordinal",
        "Value": { "$type": "System.Int32", "$value": this.data.session.Ordinal }
      })
    }
    if(this.envMode=='2017'){
      sessionData.push({
        "$type":"Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
        "Name":"ContactKey",
        "Value":this.selectedPartyId
      })
    }
    sessionData.push({
      "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
      "Name": "TotalUnallocated",
      "Value": { "$type": "System.Int32", "$value": this.data.session ? this.data.session.TotalUnallocated : 0 }
    })
    sessionData.push({
      "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
      "Name": "TotalAllocated",
      "Value": { "$type": "System.Int32", "$value": this.data.session ? this.data.session.TotalAllocated : 0 }
    })
    sessionData.push({
      "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
      "Name": "TotalSeats",
      "Value": { "$type": "System.Int32", "$value": this.data.session ? this.data.session.TotalSeats : 0 }
    })
    sessionData.push({
      "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
      "Name": "TotalTables",
      "Value": { "$type": "System.Int32", "$value": this.data.session ? this.data.session.TotalTables : 0 }
    })
    sessionData.push({
      "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
      "Name": "Programs",
      "Value": filteredPrograms.toString()
    })
    sessionData.push({
      "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
      "Name": "SessionName",
      "Value": this.SessionName
    })
    sessionData.push({
      "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
      "Name": "EventID",
      "Value": this.data.session ? this.data.session.EventID : this.data.eventID
    })
    sessionData.push({
      "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
      "Name": "SessionTimeStamp",
      "Value": this.data.session ? this.data.session.SessionTimeStamp : Math.floor(Date.now() / 1000)
    })
    let currentTimeStamp = this.data.session ? this.data.session.SessionTimeStamp : Math.floor(Date.now() / 1000);

    if (this.data.session) {
      
     
      this.seatallocationService.updateSession({ sessionID: this.data.session.Ordinal, session: sessionData ,selectedPartyId: this.selectedPartyId}).subscribe(
        result => {
          if (result) {
            this.seatallocationService.getSessionByTimeStamp(currentTimeStamp).subscribe(
              result1 => {
                this.toast.success(`${this.SessionName} is updated successfully`, "Updated Success");
                this.dialogRef.close({
                  type: 'Edit',
                  data: result1
                });
                this.isLoading = false;
              }, error1 => {
                this.toast.error("Something went wrong!! Please try again later!!", "Error");
              }
            )
          } else {
            this.toast.error("Something went wrong!! Please try again later!!", "Error");
          }
        }, error => {
          this.toast.error("Something went wrong!! Please try again later!!", "Error");
        }
      )
    } else {
      
      
      
      this.seatallocationService.addSession({ session: sessionData }).subscribe(
        result => {
          if (result) {

            this.seatallocationService.getSessionByTimeStamp(currentTimeStamp).subscribe(
              result1 => {
                this.toast.success(`${this.SessionName} is added successfully`, "Added Success");
                this.dialogRef.close({
                  type: 'add',
                  data: result1
                });
                this.isLoading = false;
              }, error1 => {
                this.toast.error("Something went wrong!! Please try again later!!", "Error");
              }
            )
          } else {
            this.toast.error("Something went wrong!! Please try again later!!", "Error");
          }
        }, error => {
          this.toast.error("Something went wrong!! Please try again later!!", "Error");
        }
      )
    }
  }

  // delete the table
  onDelete() {
    this.matSnackBar.open(`Delete ${this.data.session.SessionName}?`, 'DELETE', { duration: 50000 })
      .onAction().subscribe(() => {
        this.isLoading = true;

        
        this.seatallocationService.deleteSession(this.data.session.Ordinal,this.selectedPartyId).subscribe(
          result => {
            let increamentedValue = 0;
            if (this.data.session.tables && this.data.session.tables.length &&this.data.session.tables.length > 0) {
              this.data.session.tables.map(ele => {
                this.seatallocationService.deleteTable(ele.Ordinal,this.selectedPartyId).subscribe(
                  result1 => {
                    increamentedValue = increamentedValue + 1;
                    if (increamentedValue == this.data.session.tables.length) {
                      this.toast.success(`${this.data.session.SessionName} is deleted successfully`, "Deleted Success");
                      this.dialogRef.close({
                        type: 'delete'
                      });
                      this.isLoading = false;
                    }
                  }, error1 => {
                    this.toast.error("Something went wrong!! Please try again later!!", "Error");
                  }
                )
              })
            } else {
              this.toast.success(`${this.data.session.SessionName} is deleted successfully`, "Deleted Success");
              this.dialogRef.close({
                type: 'delete'
              });
              this.isLoading = false;
            }
          }, error => {
            console.log(error)
            this.toast.error("Something went wrong!! Please try again later!!", "Error");
          }
        )
      });
  }
}

@Component({
  selector: "session-table-dialog",
  templateUrl: "session-table-dialog.component.html",
  styleUrls: ["./seat-allocation.component.scss"]
})
export class SessionTableDialogComponent {
  // declare variables 
  tableForm: FormGroup;
  isLoading: boolean = false;
  envMode='2017'
  selectedPartyId= ''

  constructor(
    public dialogRef: MatDialogRef<SessionTableDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private seatallocationService: SeatallocationService,
    private toast: ToastrService,
    private matSnackBar: MatSnackBar) {
      if(this.envMode== '2017'){
      this.selectedPartyId= this.seatallocationService.selectedPartyIdIQA
      
      }
    this.buildForm();
  }

  buildForm() {
    this.tableForm = this.formBuilder.group({
      TableName: [this.data.sessionTable ? this.data.sessionTable.TableName : "", Validators.required],
      NumSeats: [this.data.sessionTable ? this.data.sessionTable.NumSeats : 0, [Validators.required, Validators.pattern("^[0-9]*$"), Validators.min(1)]],
      Colour: [this.data.sessionTable ? this.data.sessionTable.Colour : "#948f8f"]
    });
  }

  // close the dialog box
  onClose() {

    this.dialogRef.close({
      type: 'close'
    });
  }

  // get color and set in the form control
  getColor(color: string) {
    this.tableForm.patchValue({
      Colour: color
    })
  }

  // save the session table
  saveSessionTable() {
    if (!this.tableForm.valid) {
      this.tableForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    let tableData = new Array();
    if (this.data.sessionTable) {
      tableData.push({
        "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
        "Name": "Ordinal",
        "Value": { "$type": "System.Int32", "$value": this.data.sessionTable.Ordinal }
      })
    }
    if(this.envMode=='2017'){
      tableData.push({
        "$type":"Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
        "Name":"ContactKey",
        "Value":this.selectedPartyId
      })
    }
    tableData.push({
      "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
      "Name": "Colour",
      "Value": this.tableForm.value.Colour
    })
    tableData.push({
      "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
      "Name": "NumSeats",
      "Value": { "$type": "System.Int32", "$value": this.tableForm.value.NumSeats }
    })
    tableData.push({
      "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
      "Name": "TableName",
      "Value": this.tableForm.value.TableName
    })
    tableData.push({
      "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
      "Name": "SessionID",
      "Value": { "$type": "System.Int32", "$value": this.data.session.Ordinal }
    })
    tableData.push({
      "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
      "Name": "EventID",
      "Value": this.data.sessionTable ? this.data.sessionTable.EventID : this.data.eventID
    })

    let sessionData = new Array();
    if(this.envMode=='2017'){
      sessionData.push({
        "$type":"Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
        "Name":"ContactKey",
        "Value":this.selectedPartyId
      })
    }
    sessionData.push({
      "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
      "Name": "Ordinal",
      "Value": { "$type": "System.Int32", "$value": this.data.session.Ordinal }
    })

    sessionData.push({
      "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
      "Name": "TotalUnallocated",
      "Value": { "$type": "System.Int32", "$value": this.data.session.TotalUnallocated }
    })
    sessionData.push({
      "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
      "Name": "TotalAllocated",
      "Value": { "$type": "System.Int32", "$value": this.data.session.TotalAllocated }
    })
    sessionData.push({
      "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
      "Name": "TotalSeats",
      "Value": {
        "$type": "System.Int32", "$value": this.data.sessionTable ?
          (parseInt(this.data.session.TotalSeats) - parseInt(this.data.sessionTable.NumSeats)) + parseInt(this.tableForm.value.NumSeats)
          : parseInt(this.data.session.TotalSeats) + parseInt(this.tableForm.value.NumSeats)
      }
    })
    sessionData.push({
      "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
      "Name": "TotalTables",
      "Value": { "$type": "System.Int32", "$value": this.data.sessionTable ? this.data.session.TotalTables : this.data.session.TotalTables + 1 }
    })
    sessionData.push({
      "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
      "Name": "Programs",
      "Value": this.data.session.Programs.join()
    })
    sessionData.push({
      "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
      "Name": "SessionName",
      "Value": this.data.session.SessionName
    })
    sessionData.push({
      "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
      "Name": "EventID",
      "Value": this.data.session.EventID
    })
    sessionData.push({
      "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
      "Name": "SessionTimeStamp",
      "Value": this.data.session.SessionTimeStamp
    })
    if (this.data.sessionTable) {
      this.seatallocationService.updateTable({ tableID: this.data.sessionTable.Ordinal, table: tableData ,selectedPartyId: this.selectedPartyId}).subscribe(
        result => {
          if (result) this.updateSession(sessionData);
          else this.toast.error("Something went wrong!! Please try again later!!", "Error");
        }, error => {
          this.toast.error("Something went wrong!! Please try again later!!", "Error");
        }
      )
    } else {
      this.seatallocationService.addTable({ table: tableData }).subscribe(
        result => {
          if (result) this.updateSession(sessionData);
          else this.toast.error("Something went wrong!! Please try again later!!", "Error");
        }, error => {
          this.toast.error("Something went wrong!! Please try again later!!", "Error");
        }
      )
    }
  }

  // delete the table


  async onDelete() {
    const snackBarRef = this.matSnackBar.open(`Delete ${this.data.sessionTable.TableName}?`, 'DELETE', { duration: 100000 });
  
    snackBarRef.onAction().subscribe(async () => {
      try {
        this.isLoading = true;
        await this.seatallocationService.deleteTable(this.data.sessionTable.Ordinal, this.selectedPartyId).toPromise();
  
        const registrants = this.data.sessionTable.tablesAllocatedRegistrants || [];
  
        if (registrants.length > 0) {
          for (let ele of registrants) {
            const registrantData: any[] = [
              this.createProp("Ordinal", { "$type": "System.Int32", "$value": ele.Ordinal }),
              this.createProp("SessionID", { "$type": "System.Int32", "$value": ele.SessionID }),
              this.createProp("EventID", ele.EventID),
              this.createProp("RegistrantID", ele.RegistrantID),
              this.createProp("RegistrantName", ele.RegistrantName),
              this.createProp("SortOrder", { "$type": "System.Int32", "$value": 0 }),
              this.createProp("TableID", { "$type": "System.Int32", "$value": 0 })
            ];
  
            if (this.envMode === '2017') {
              registrantData.push(this.createProp("ContactKey", this.selectedPartyId));
            }
  
            await this.seatallocationService.updateRegistrant(
              { registrantID: ele.Ordinal, registrant: registrantData },
              this.selectedPartyId
            ).toPromise();
          }
  
          this.updateSession(this.buildSessionData(registrants.length), true);
        } else {
          this.updateSession(this.buildSessionData(0), true);
        }
      } catch (error) {
        this.toast.error("Something went wrong!! Please try again later!!", "Error");
      } finally {
        this.isLoading = false;
      }
    });
  }
  
  private createProp(name: string, value: any) {
    return {
      "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
      "Name": name,
      "Value": value
    };
  }
  
  private buildSessionData(removedCount: number): any[] {
    const s = this.data.session;
    const t = this.data.sessionTable;
  
    const data: any[] = [
      this.createProp("Ordinal", { "$type": "System.Int32", "$value": s.Ordinal }),
      this.createProp("TotalUnallocated", { "$type": "System.Int32", "$value": parseInt(s.TotalUnallocated) + removedCount }),
      this.createProp("TotalAllocated", { "$type": "System.Int32", "$value": parseInt(s.TotalAllocated) - removedCount }),
      this.createProp("TotalSeats", { "$type": "System.Int32", "$value": parseInt(s.TotalSeats) - parseInt(t.NumSeats) }),
      this.createProp("TotalTables", { "$type": "System.Int32", "$value": parseInt(s.TotalTables) - 1 }),
      this.createProp("Programs", s.Programs.join()),
      this.createProp("SessionName", s.SessionName),
      this.createProp("EventID", s.EventID),
      this.createProp("SessionTimeStamp", s.SessionTimeStamp)
    ];
  
    if (this.envMode === '2017') {
      data.unshift(this.createProp("ContactKey", this.selectedPartyId));
    }
  
    return data;
  }
  




  // onDelete() {
   
  //   this.matSnackBar.open(`Delete ${this.data.sessionTable.TableName}?`, 'DELETE', { duration: 100000 })
  //     .onAction().subscribe(() => {
  //       this.isLoading = true;
        
  //       this.seatallocationService.deleteTable(this.data.sessionTable.Ordinal,this.selectedPartyId).subscribe(
  //         result => {

            
           

  //           if ( this.data.sessionTable && this.data.sessionTable.tablesAllocatedRegistrants && this.data.sessionTable.tablesAllocatedRegistrants.length && this.data.sessionTable.tablesAllocatedRegistrants.length > 0) {
  //             let increamentedValue = 0;
  //             this.data.sessionTable.tablesAllocatedRegistrants.map(ele => {
  //               let registrantData = [{
  //                 "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //                 "Name": "Ordinal",
  //                 "Value": {
  //                   "$type": "System.Int32",
  //                   "$value": ele.Ordinal
  //                 }
  //               },
  //               {
  //                 "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //                 "Name": "SessionID",
  //                 "Value": {
  //                   "$type": "System.Int32",
  //                   "$value": ele.SessionID
  //                 }
  //               },
  //               {
  //                 "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //                 "Name": "EventID",
  //                 "Value": ele.EventID
  //               },
  //               {
  //                 "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //                 "Name": "RegistrantID",
  //                 "Value": ele.RegistrantID
  //               },
  //               {
  //                 "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //                 "Name": "RegistrantName",
  //                 "Value": ele.RegistrantName
  //               },
  //               {
  //                 "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //                 "Name": "SortOrder",
  //                 "Value": {
  //                   "$type": "System.Int32",
  //                   "$value": 0
  //                 }
  //               },
  //               {
  //                 "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //                 "Name": "TableID",
  //                 "Value": {
  //                   "$type": "System.Int32",
  //                   "$value": 0
  //                 }
  //               }]
  //               if(this.envMode== '2017'){
  //                 registrantData.push(
  //                   {
  //                     "$type":"Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //                     "Name":"ContactKey",
  //                     "Value":this.selectedPartyId
  //                   }
  //                 )
  //             }
  //               this.seatallocationService.updateRegistrant({ registrantID: ele.Ordinal, registrant: registrantData },this.selectedPartyId).subscribe(
  //                 result1 => {
  //                   increamentedValue = increamentedValue + 1;
  //                   if (increamentedValue == this.data.sessionTable.tablesAllocatedRegistrants.length) {
  //                     let sessionData = new Array();
  //                     if(this.envMode=='2017'){
  //                       sessionData.push({
  //                         "$type":"Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //                         "Name":"ContactKey",
  //                         "Value":this.selectedPartyId
  //                       })
  //                     }
  //                     sessionData.push({
  //                       "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //                       "Name": "Ordinal",
  //                       "Value": { "$type": "System.Int32", "$value": this.data.session.Ordinal }
  //                     })
  //                     sessionData.push({
  //                       "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //                       "Name": "TotalUnallocated",
  //                       "Value": { "$type": "System.Int32", "$value": parseInt(this.data.session.TotalUnallocated) + this.data.sessionTable.tablesAllocatedRegistrants.length }
  //                     })
  //                     sessionData.push({
  //                       "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //                       "Name": "TotalAllocated",
  //                       "Value": { "$type": "System.Int32", "$value": parseInt(this.data.session.TotalAllocated) - this.data.sessionTable.tablesAllocatedRegistrants.length }
  //                     })
  //                     sessionData.push({
  //                       "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //                       "Name": "TotalSeats",
  //                       "Value": {
  //                         "$type": "System.Int32", "$value": parseInt(this.data.session.TotalSeats) - parseInt(this.data.sessionTable.NumSeats)
  //                       }
  //                     })
  //                     sessionData.push({
  //                       "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //                       "Name": "TotalTables",
  //                       "Value": { "$type": "System.Int32", "$value": parseInt(this.data.session.TotalTables) - 1 }
  //                     })
  //                     sessionData.push({
  //                       "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //                       "Name": "Programs",
  //                       "Value": this.data.session.Programs.join()
  //                     })
  //                     sessionData.push({
  //                       "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //                       "Name": "SessionName",
  //                       "Value": this.data.session.SessionName
  //                     })
  //                     sessionData.push({
  //                       "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //                       "Name": "EventID",
  //                       "Value": this.data.session.EventID
  //                     })
  //                     sessionData.push({
  //                       "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //                       "Name": "SessionTimeStamp",
  //                       "Value": this.data.session.SessionTimeStamp
  //                     })
  //                     this.updateSession(sessionData, true);
  //                   }
  //                 }, error => {
  //                   this.toast.error("Something went wrong!! Please try again later!!", "Error");
  //                 }
  //               )
  //             })
  //           } else {
  //             let sessionData = new Array();
  //             if(this.envMode=='2017'){
  //               sessionData.push({
  //                 "$type":"Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //                 "Name":"ContactKey",
  //                 "Value":this.selectedPartyId
  //               })
  //             }
  //             sessionData.push({
  //               "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //               "Name": "Ordinal",
  //               "Value": { "$type": "System.Int32", "$value": this.data.session.Ordinal }
  //             })
  //             sessionData.push({
  //               "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //               "Name": "TotalUnallocated",
  //               "Value": { "$type": "System.Int32", "$value": this.data.session.TotalUnallocated }
  //             })
  //             sessionData.push({
  //               "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //               "Name": "TotalAllocated",
  //               "Value": { "$type": "System.Int32", "$value": this.data.session.TotalAllocated }
  //             })
  //             sessionData.push({
  //               "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //               "Name": "TotalSeats",
  //               "Value": {
  //                 "$type": "System.Int32", "$value": parseInt(this.data.session.TotalSeats) - parseInt(this.data.sessionTable.NumSeats)
  //               }
  //             })
  //             sessionData.push({
  //               "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //               "Name": "TotalTables",
  //               "Value": { "$type": "System.Int32", "$value": parseInt(this.data.session.TotalTables) - 1 }
  //             })
  //             sessionData.push({
  //               "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //               "Name": "Programs",
  //               "Value": this.data.session.Programs.join()
  //             })
  //             sessionData.push({
  //               "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //               "Name": "SessionName",
  //               "Value": this.data.session.SessionName
  //             })
  //             sessionData.push({
  //               "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //               "Name": "EventID",
  //               "Value": this.data.session.EventID
  //             })
  //             sessionData.push({
  //               "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
  //               "Name": "SessionTimeStamp",
  //               "Value": this.data.session.SessionTimeStamp
  //             })
  //             this.updateSession(sessionData, true);
  //           }
  //         }, error => {
  //           this.toast.error("Something went wrong!! Please try again later!!", "Error");
  //         }
  //       )
  //     });
  // }

  // update Session
  updateSession(sessionData, isDeleted = null) {
    this.seatallocationService.updateSession({ sessionID: this.data.session.Ordinal, session: sessionData ,selectedPartyId: this.selectedPartyId}).subscribe(
      result => {
        if (result) {
          if (isDeleted) {
            
            this.toast.success(`${this.data.sessionTable.TableName} is deleted successfully`, "Deleted Success");
            this.dialogRef.close({
              type: 'delete'
            });
            this.isLoading = false;
          } else {
            if (this.data.sessionTable) this.toast.success(`${this.tableForm.value.TableName} is updated successfully`, "Updated Success");
            else this.toast.success(`${this.tableForm.value.TableName} is added successfully`, "Added Success");
            
            this.dialogRef.close({
              type: 'addEdit',
              result
            });
            this.isLoading = false;
          }
        } else {
          this.toast.error("Something went wrong!! Please try again later!!", "Error");
        }
      }, error => {
        this.toast.error("Something went wrong!! Please try again later!!", "Error");
      }
    )
  }

  // Form validations start
  get TableName() {
    return this.tableForm.get("TableName");
  }
  get NumSeats() {
    return this.tableForm.get("NumSeats");
  }
  // Form validations end
}