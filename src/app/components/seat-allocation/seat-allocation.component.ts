import { Component, OnInit, Inject } from '@angular/core';
import { faExclamationTriangle, faCaretUp, faCaretDown, faSyncAlt, faInfo, faFilePdf, faChevronUp, faChevronDown, faTrashAlt, faEllipsisV, faCheckCircle, faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SeatallocationService } from 'src/app/services/seatallocation.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastrService } from 'ngx-toastr';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-seat-allocation',
  templateUrl: './seat-allocation.component.html',
  styleUrls: ['./seat-allocation.component.scss']
})
export class SeatAllocationComponent implements OnInit {

  envMode='2017'
  selectedPartyId= JSON.parse(document.getElementById('__ClientContext')['value']).selectedPartyId

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
    this.isLoading = true;
    let currentURL = window.location.href;


   
    var url = new URL(currentURL);
    var eventKeyValue = url.searchParams.get("EventKey");
    this.eventID = eventKeyValue
    this.getPrograms();
  }

  // fetch the programs as per the current EventID
  async getPrograms() {
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
    
    this.seatallocationService.getTables(this.eventID).subscribe(
      result => {
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
            result.map((ele1: any, index1) => {
              registrantsResult[index1] = []
              ele1.Properties.$values.map(ele1 => {
                registrantsResult[index1][ele1.Name] = typeof (ele1.Value) == 'object' ? ele1.Value.$value : ele1.Value;
              })
            })
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
              console.log(ele4['allocatedRegistrants']);
              if (ele4['allocatedRegistrants'] && ele4['allocatedRegistrants'].length > 0) {
                ele4['allocatedRegistrants'].map(ele1 => {
                  ele1['tableName'] = "";
                  let filteredTables = ele4.tables.filter(ele2 => ele2.Ordinal == ele1.TableID);
                  if (filteredTables.length > 0) {
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
    console.log(this.advancedSessions)
  }

  // open dialog box to add/edit session
  openSessionDialog(session = null, sessionIndex = null) {
    let existingSession = session;
    const dialogRef = this.sessionDialog.open(SessionDialogComponent, {
      width: '600px',
      data: { session: existingSession, programs: this.programs, eventID: this.eventID },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(response => {
      if (response.type == 'add') {
        this.isLoading = true;
        if (response.data && response.data.length > 0) {
          let programNamesWithQuotes = '"' + response.data[0].Properties.$values.filter(ele => ele.Name == 'Programs')[0].Value.split(",").join('","') + '"';
          this.seatallocationService.getIQARegistrants(programNamesWithQuotes).subscribe(
            (result: any) => {
              if (result.length > 0) {
                let RegistrantsDetails = [];
                result = result.filter((thing, index, self) =>
                  index === self.findIndex((t) => (
                    t.Properties.$values.filter(ele1 => ele1.Name == 'RegistrantID')[0].Value === thing.Properties.$values.filter(ele1 => ele1.Name == 'RegistrantID')[0].Value
                  ))
                )
                result.map((ele, index) => {
                  let RegistrantID = ele.Properties.$values.filter(ele1 => ele1.Name == 'RegistrantID');
                  let FullName = ele.Properties.$values.filter(ele1 => ele1.Name == 'FullName');
                  let tempData= {
                    "$type": "Asi.Soa.Core.DataContracts.GenericEntityData, Asi.Contracts",
                    "EntityTypeName": this.envMode == '2017'? 'Psc_Event_Registrant_2017' :'Psc_Event_Registrant',
                    
                    "Properties": {
                      "$type": "Asi.Soa.Core.DataContracts.GenericPropertyDataCollection, Asi.Contracts",
                      "$values": [{
                        "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                        "Name": "SessionID",
                        "Value": {
                          "$type": "System.Int32",
                          "$value": response.data[0].Properties.$values.filter(ele1 => ele1.Name == 'Ordinal')[0].Value.$value
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
                        "Value": RegistrantID[0].Value
                      },
                      {
                        "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                        "Name": "RegistrantName",
                        "Value": FullName[0].Value
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
                    tempData.Properties.$values.push({
                      "$type":"Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                      "Name":"ContactKey",
                      "Value":this.selectedPartyId
                    }

                    )
                  }
                  RegistrantsDetails.push(tempData)

                  
                  if (result.length == index + 1) {
                    let increamentedValue = 0;
                    RegistrantsDetails.map((RegistrantElement, RegistrantIndex) => {
                      console.log('resistant 1')
                      this.seatallocationService.addRegistrant(RegistrantElement).subscribe(
                        RegistrantResult => {
                          increamentedValue = increamentedValue + 1;
                          if (increamentedValue == RegistrantsDetails.length) {
                            this.seatallocationService.getRegistrants(response.data[0].Properties.$values.filter(ele1 => ele1.Name == 'EventID')[0].Value, response.data[0].Properties.$values.filter(ele1 => ele1.Name == 'Ordinal')[0].Value.$value).subscribe(
                              (RegistrantsResult: any) => {
                                console.log('update session 1')
                                this.updateSession(response, RegistrantsResult.length);
                              }, RegistrantsError => {
                                this.toast.error("Something went wrong!! Please try again later!!", "Error");
                              }
                            )
                          }
                        }, RegistrantError => {
                          this.toast.error("Something went wrong!! Please try again later!!", "Error");
                        }
                      )
                    })
                  }
                })
              } else {
                this.getPrograms();
              }
            }, error => {
              this.toast.error("Something went wrong!! Please try again later!!", "Error");
            }
          )
        } else {
          this.isLoading = false;
        }
        // this.getPrograms();
      } else if (response.type == 'Edit') {
        this.isLoading = true;
        if (response.data && response.data.length > 0) {
          let programNamesWithQuotes = '"' + response.data[0].Properties.$values.filter(ele => ele.Name == 'Programs')[0].Value.split(",").join('","') + '"';
          this.seatallocationService.getIQARegistrants(programNamesWithQuotes).subscribe(
            (result: any) => {
              if (result.length > 0) {
                result = result.filter((thing, index, self) =>
                  index === self.findIndex((t) => (
                    t.Properties.$values.filter(ele1 => ele1.Name == 'RegistrantID')[0].Value === thing.Properties.$values.filter(ele1 => ele1.Name == 'RegistrantID')[0].Value
                  ))
                )
                let filteredResult = [];
                result.map((ele: any, index) => {
                  filteredResult[index] = []
                  ele.Properties.$values.map(ele1 => {
                    filteredResult[index][ele1.Name] = typeof (ele1.Value) == 'object' ? ele1.Value.$value : ele1.Value;
                  })
                })
                let uniqueNewRegistrants = filteredResult.filter(x => !this.advancedSessions[sessionIndex].allRegistrants.some(registrant => registrant.RegistrantID === x.RegistrantID));
                let uniqueOldRegistrants = this.advancedSessions[sessionIndex].allRegistrants.filter(x => !filteredResult.some(registrant => registrant.RegistrantID === x.RegistrantID));
                let uniqueOldRegistrantsCount = 0;
                if (uniqueOldRegistrants.length > 0) {
                  uniqueOldRegistrants.map(ele => {
                    this.seatallocationService.deleteRegistrant(ele.Ordinal).subscribe(
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
                              console.log('resistant 2')
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
                                        console.log('update session 2')
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
                            "Value": ele1.FullName
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
                      console.log('resistant 3')
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
                                console.log('update session 3')
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
                    this.seatallocationService.deleteRegistrant(ele.Ordinal).subscribe(
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
                          console.log('update session 4')
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
            }, error => {
              this.toast.error("Something went wrong!! Please try again later!!", "Error");
            }
          )
        } else {
          this.isLoading = false;
        }
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
              updatedRegistrantsResult.map(ele => {
                this.seatallocationService.deleteRegistrant(ele.Ordinal).subscribe(
                  deleteRegistrantResult => {
                    increamentedValue = increamentedValue + 1;
                    if (increamentedValue == updatedRegistrantsResult.length) {
                      this.getPrograms();
                    }
                  }, deleteRegistrantError => {
                    this.toast.error("Something went wrong!! Please try again later!!", "Error");
                  }
                )
              })
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
  //   console.log("Panel going to close!");
  // }
  // beforePanelOpened(panel){
  //   panel.isExpanded = true;
  //   console.log("Panel going to  open!");
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
    console.log('update session 5')
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

  // auto assign the registrants to all the tables
  async autoAssignAll(sessionIndex) {
    this.isLoading = true;
    let totalUnallocated = 0;
    let unallocatedTableDetails = [];

    this.advancedSessions[sessionIndex].tables.map(ele => {
      totalUnallocated = totalUnallocated + parseInt(ele.remainingUnallocatedRegistrantsSeats);
      for (let i = 0; i < parseInt(ele.remainingUnallocatedRegistrantsSeats); i++) {
        unallocatedTableDetails.push(ele);
      }
    })

    if (totalUnallocated > 0) {
      let unallocatedRegistrants = this.advancedSessions[sessionIndex].unallocatedRegistrants;
      let RegistrantsData = [];

      for (let i = 0; i < totalUnallocated; i++) {
        if (unallocatedRegistrants.length > i) {
          RegistrantsData.push({
            registrantID: unallocatedRegistrants[i].Ordinal,
            registrant: [{
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
            }]
            
          });
          if(this.envMode== '2017'){
              RegistrantsData[i].registrant.push(
                {
                  "$type":"Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                  "Name":"ContactKey",
                  "Value":this.selectedPartyId
                }
              )
          }
        }
        if (totalUnallocated == i + 1) {
          let increamentedValue = 0;
          RegistrantsData.map(ele => {
            this.seatallocationService.updateRegistrant(ele,this.selectedPartyId).subscribe(
              result => {
                increamentedValue = increamentedValue + 1;
                if (increamentedValue == RegistrantsData.length) {
                  this.seatallocationService.getRegistrants(this.eventID, this.advancedSessions[sessionIndex].Ordinal).subscribe(
                    result1 => {
                      let registrantsResult = [];
                      result1.map((ele1: any, index) => {
                        registrantsResult[index] = []
                        ele1.Properties.$values.map(ele1 => {
                          registrantsResult[index][ele1.Name] = typeof (ele1.Value) == 'object' ? ele1.Value.$value : ele1.Value;
                        })
                      })

                      let unallocatedRegistrantsLength = registrantsResult.filter(ele1 => ele1.TableID == 0);
                      let allocatedRegistrantsLength = registrantsResult.filter(ele1 => ele1.TableID != 0);

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
                        "Value": { "$type": "System.Int32", "$value": unallocatedRegistrantsLength.length }
                      })
                      sessionData.push({
                        "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                        "Name": "TotalAllocated",
                        "Value": { "$type": "System.Int32", "$value": allocatedRegistrantsLength.length }
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
                      console.log('update session 6')
                      this.seatallocationService.updateSession({ sessionID: this.advancedSessions[sessionIndex].Ordinal, session: sessionData,selectedPartyId: this.selectedPartyId }).subscribe(
                        result => {
                          this.toast.success("Auto Assign All has been completed. Please wait while we are updating the records!!", "Success");
                          this.getPrograms();
                        }, error => {
                          this.toast.error("Something went wrong!! Please try again later!!", "Error");
                        }
                      )
                    }, error1 => {
                      this.toast.error("Something went wrong!! Please try again later!!", "Error");
                    }
                  )
                }
              }, error => {
                this.toast.error("Something went wrong!! Please try again later!!", "Error");
              }
            )
          })
        }
      }
    } else {
      this.isLoading = false;
    }
  }

  // auto assign the registrants to the selected table
  async autoAssignAllToTable(sessionIndex) {
    this.isLoading = true;
    if (this.advancedSessions[sessionIndex].tables.filter(ele => ele.Ordinal == this.advancedSessions[sessionIndex].tableOpened.Ordinal)[0].remainingUnallocatedRegistrantsSeats > 0) {
      let unallocatedRegistrants = this.advancedSessions[sessionIndex].unallocatedRegistrants;
      let RegistrantsData = [];

      for (let i = 0; i < this.advancedSessions[sessionIndex].tables.filter(ele => ele.Ordinal == this.advancedSessions[sessionIndex].tableOpened.Ordinal)[0].remainingUnallocatedRegistrantsSeats; i++) {
        if (unallocatedRegistrants.length > i) {
          RegistrantsData.push({
            registrantID: unallocatedRegistrants[i].Ordinal,
            registrant: [{
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
                "$value": this.advancedSessions[sessionIndex].tables.filter(ele => ele.Ordinal == this.advancedSessions[sessionIndex].tableOpened.Ordinal)[0].Ordinal
              }
            }]
          });
          if(this.envMode== '2017'){
            RegistrantsData[i].registrant.push(
              {
                "$type":"Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                "Name":"ContactKey",
                "Value":this.selectedPartyId
              }
            )
        }
        }
        if (this.advancedSessions[sessionIndex].tables.filter(ele => ele.Ordinal == this.advancedSessions[sessionIndex].tableOpened.Ordinal)[0].remainingUnallocatedRegistrantsSeats == i + 1) {
          let increamentedValue = 0;
          RegistrantsData.map(ele => {
            this.seatallocationService.updateRegistrant(ele,this.selectedPartyId).subscribe(
              result => {
                increamentedValue = increamentedValue + 1;
                if (increamentedValue == RegistrantsData.length) {
                  this.seatallocationService.getRegistrants(this.eventID, this.advancedSessions[sessionIndex].Ordinal).subscribe(
                    result1 => {
                      let registrantsResult = [];
                      result1.map((ele1: any, index) => {
                        registrantsResult[index] = []
                        ele1.Properties.$values.map(ele1 => {
                          registrantsResult[index][ele1.Name] = typeof (ele1.Value) == 'object' ? ele1.Value.$value : ele1.Value;
                        })
                      })

                      let unallocatedRegistrantsLength = registrantsResult.filter(ele1 => ele1.TableID == 0);
                      let allocatedRegistrantsLength = registrantsResult.filter(ele1 => ele1.TableID != 0);

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
                        "Value": { "$type": "System.Int32", "$value": unallocatedRegistrantsLength.length }
                      })
                      sessionData.push({
                        "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                        "Name": "TotalAllocated",
                        "Value": { "$type": "System.Int32", "$value": allocatedRegistrantsLength.length }
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
                      console.log('update session 7')
                      this.seatallocationService.updateSession({ sessionID: this.advancedSessions[sessionIndex].Ordinal, session: sessionData ,selectedPartyId: this.selectedPartyId}).subscribe(
                        result => {
                          this.toast.success("Auto Assign has been completed. Please wait while we are updating the records!!", "Success");
                          this.getPrograms();
                        }, error => {
                          this.toast.error("Something went wrong!! Please try again later!!", "Error");
                        }
                      )
                    }, error1 => {
                      this.toast.error("Something went wrong!! Please try again later!!", "Error");
                    }
                  )
                }
              }, error => {
                this.toast.error("Something went wrong!! Please try again later!!", "Error");
              }
            )
          })
        }
      }
    } else {
      this.isLoading = false;
    }
  }

  // manual assign the registrants to the selected table
  async manualAssignAllToTable(sessionIndex) {
    this.isLoading = true;
    if (this.advancedSessions[sessionIndex].tables.filter(ele => ele.Ordinal == this.advancedSessions[sessionIndex].tableOpened.Ordinal)[0].remainingUnallocatedRegistrantsSeats > 0) {
      let unallocatedRegistrants = this.advancedSessions[sessionIndex].unallocatedRegistrants.filter(ele => ele.multiSelect);
      let RegistrantsData = [];

      for (let i = 0; i < this.advancedSessions[sessionIndex].tables.filter(ele => ele.Ordinal == this.advancedSessions[sessionIndex].tableOpened.Ordinal)[0].remainingUnallocatedRegistrantsSeats; i++) {
        if (unallocatedRegistrants.length > i) {
          RegistrantsData.push({
            registrantID: unallocatedRegistrants[i].Ordinal,
            registrant: [{
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
                "$value": this.advancedSessions[sessionIndex].tables.filter(ele => ele.Ordinal == this.advancedSessions[sessionIndex].tableOpened.Ordinal)[0].Ordinal
              }
            }]
          });
          if(this.envMode== '2017'){
            RegistrantsData[i].registrant.push(
              {
                "$type":"Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                "Name":"ContactKey",
                "Value":this.selectedPartyId
              }
            )
        }
        }
        if (this.advancedSessions[sessionIndex].tables.filter(ele => ele.Ordinal == this.advancedSessions[sessionIndex].tableOpened.Ordinal)[0].remainingUnallocatedRegistrantsSeats == i + 1) {
          let increamentedValue = 0;
          RegistrantsData.map(ele => {
            this.seatallocationService.updateRegistrant(ele,this.selectedPartyId).subscribe(
              result => {
                increamentedValue = increamentedValue + 1;
                if (increamentedValue == RegistrantsData.length) {
                  this.seatallocationService.getRegistrants(this.eventID, this.advancedSessions[sessionIndex].Ordinal).subscribe(
                    result1 => {
                      let registrantsResult = [];
                      result1.map((ele1: any, index) => {
                        registrantsResult[index] = []
                        ele1.Properties.$values.map(ele1 => {
                          registrantsResult[index][ele1.Name] = typeof (ele1.Value) == 'object' ? ele1.Value.$value : ele1.Value;
                        })
                      })

                      let unallocatedRegistrantsLength = registrantsResult.filter(ele1 => ele1.TableID == 0);
                      let allocatedRegistrantsLength = registrantsResult.filter(ele1 => ele1.TableID != 0);

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
                        "Value": { "$type": "System.Int32", "$value": unallocatedRegistrantsLength.length }
                      })
                      sessionData.push({
                        "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                        "Name": "TotalAllocated",
                        "Value": { "$type": "System.Int32", "$value": allocatedRegistrantsLength.length }
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
                      console.log('update session 8')
                      this.seatallocationService.updateSession({ sessionID: this.advancedSessions[sessionIndex].Ordinal, session: sessionData,selectedPartyId: this.selectedPartyId }).subscribe(
                        result => {
                          this.toast.success("Manual Assign has been completed. Please wait while we are updating the records!!", "Success");
                          this.getPrograms();
                        }, error => {
                          this.toast.error("Something went wrong!! Please try again later!!", "Error");
                        }
                      )
                    }, error1 => {
                      this.toast.error("Something went wrong!! Please try again later!!", "Error");
                    }
                  )
                }
              }, error => {
                this.toast.error("Something went wrong!! Please try again later!!", "Error");
              }
            )
          })
        }
      }
    } else {
      this.isLoading = false;
    }
  }

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
    window.open(`/SeatAllocationReport?Event Code=${this.advancedSessions[sessionIndex].EventID}&SessionID=${this.advancedSessions[sessionIndex].Ordinal}`, "_blank");
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
  selectedPartyId= JSON.parse(document.getElementById('__ClientContext')['value']).selectedPartyId
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
    this.sessionPrograms = [];
    console.log(this.selectedPartyId)

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
            if (this.data.session.tables.length > 0) {
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
  selectedPartyId= JSON.parse(document.getElementById('__ClientContext')['value']).selectedPartyId

  constructor(
    public dialogRef: MatDialogRef<SessionTableDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private seatallocationService: SeatallocationService,
    private toast: ToastrService,
    private matSnackBar: MatSnackBar) {
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
  onDelete() {
    console.log('delete 0')
    this.matSnackBar.open(`Delete ${this.data.sessionTable.TableName}?`, 'DELETE', { duration: 100000 })
      .onAction().subscribe(() => {
        this.isLoading = true;
        console.log('delete 1')
        this.seatallocationService.deleteTable(this.data.sessionTable.Ordinal,this.selectedPartyId).subscribe(
          result => {

            console.log(this.data.sessionTable)
           

            if ( this.data.sessionTable && this.data.sessionTable.tablesAllocatedRegistrants && this.data.sessionTable.tablesAllocatedRegistrants.length && this.data.sessionTable.tablesAllocatedRegistrants.length > 0) {
              let increamentedValue = 0;
              this.data.sessionTable.tablesAllocatedRegistrants.map(ele => {
                let registrantData = [{
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
                this.seatallocationService.updateRegistrant({ registrantID: ele.Ordinal, registrant: registrantData },this.selectedPartyId).subscribe(
                  result1 => {
                    increamentedValue = increamentedValue + 1;
                    if (increamentedValue == this.data.sessionTable.tablesAllocatedRegistrants.length) {
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
                        "Value": { "$type": "System.Int32", "$value": parseInt(this.data.session.TotalUnallocated) + this.data.sessionTable.tablesAllocatedRegistrants.length }
                      })
                      sessionData.push({
                        "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                        "Name": "TotalAllocated",
                        "Value": { "$type": "System.Int32", "$value": parseInt(this.data.session.TotalAllocated) - this.data.sessionTable.tablesAllocatedRegistrants.length }
                      })
                      sessionData.push({
                        "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                        "Name": "TotalSeats",
                        "Value": {
                          "$type": "System.Int32", "$value": parseInt(this.data.session.TotalSeats) - parseInt(this.data.sessionTable.NumSeats)
                        }
                      })
                      sessionData.push({
                        "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                        "Name": "TotalTables",
                        "Value": { "$type": "System.Int32", "$value": parseInt(this.data.session.TotalTables) - 1 }
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
                      this.updateSession(sessionData, true);
                    }
                  }, error => {
                    this.toast.error("Something went wrong!! Please try again later!!", "Error");
                  }
                )
              })
            } else {
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
                  "$type": "System.Int32", "$value": parseInt(this.data.session.TotalSeats) - parseInt(this.data.sessionTable.NumSeats)
                }
              })
              sessionData.push({
                "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
                "Name": "TotalTables",
                "Value": { "$type": "System.Int32", "$value": parseInt(this.data.session.TotalTables) - 1 }
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
              this.updateSession(sessionData, true);
            }
          }, error => {
            this.toast.error("Something went wrong!! Please try again later!!", "Error");
          }
        )
      });
  }

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