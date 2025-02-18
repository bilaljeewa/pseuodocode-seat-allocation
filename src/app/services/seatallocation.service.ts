import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, delay, map, mergeMap } from 'rxjs/operators';

import { Programs, Sessions, IQARegistrant } from "../models/SeatAllocation";

@Injectable({
  providedIn: 'root'
})
export class SeatallocationService {
  live: boolean = true;
  baseUrl: string;
  token: string;
  envMode: string='2017'
  httpOptions:any;

  constructor(private httpClient: HttpClient) {
    this.getContext();
  }

  private getContext() {
    var clientContextStr = (document.querySelector('#__ClientContext') as HTMLInputElement).value;
    var clientContext = JSON.parse(clientContextStr);
    this.token = (document.querySelector('#__RequestVerificationToken') as HTMLInputElement).value;
    this.baseUrl = 'http://localhost:4200/';
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
        // 'RequestVerificationToken': this.token
        // using this at the time of run locally'RequestVerificationToken': this.token 
      })
    }
  }

  // get programs for session starts
  public getPrograms(eventID): Observable<any[]> {
    if (this.live) return this.getLivePrograms(eventID);
    else return this.getFakedPrograms(eventID);
  }

  private getLivePrograms(eventID): Observable<any[]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
 'RequestVerificationToken': this.token
      })
    }

    // httpOptions = {
    //   headers: new HttpHeaders({
    //     'Content-Type': 'application/json',
    //     'RequestVerificationToken': this.token
    //   })
    // }

    
    
    let url =  `api/Event?EventId=` + eventID;
    console.log(url)
    return this.httpClient.get(url, this.httpOptions)
      .pipe(map((res: any) => {
        return res.Items.$values;
      }));
  }

  private getFakedPrograms(eventID): Observable<any[]> {
    let data = []
    return of(data).pipe(delay(500));
  }
  // get programs for session ends



  // get sessions starts
  public getSessions(eventID): Observable<Sessions[]> {
    if (this.live) return this.getLiveSessions(eventID);
    else return this.getFakedSessions(eventID);
  }

  private getLiveSessions(eventID): Observable<Sessions[]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
 'RequestVerificationToken': this.token
      })
    }
    let url =  `api/${this.envMode=='2017'?'Psc_Event_Session_2017' :'Psc_Event_Session'}?EventID=` + eventID;
    return this.httpClient.get(url, this.httpOptions)
      .pipe(map((res: any) => {
        return res.Items.$values
      }));
  }

  private getFakedSessions(eventID): Observable<Sessions[]> {
    let data = []
    return of(data).pipe(delay(500));
  }
  // get sessions ends



  // add session starts
  public addSession(data): Observable<Sessions> {
    if (this.live) return this.addLiveSession(data);
    else return this.addFakedSession(data);
  }

  private addLiveSession(data): Observable<Sessions> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
//  'RequestVerificationToken': this.token
'Authorization': `Bearer ${this.token}`
      })
    }
    let postSessionData = {}

    if(this.envMode=='2017'){
      postSessionData={
        "$type": "Asi.Soa.Core.DataContracts.GenericEntityData, Asi.Contracts",
         "EntityTypeName": "Psc_Event_Session_2017",
         "Properties": {
          "$type": "Asi.Soa.Core.DataContracts.GenericPropertyDataCollection, Asi.Contracts",
          "$values": data.session
        }
      }

    }else{
      postSessionData={
         "$type": "Asi.Soa.Core.DataContracts.GenericEntityData, Asi.Contracts",
          "EntityTypeName": "Psc_Event_Session",
          "PrimaryParentEntityTypeName": "Standalone",
          "Identity": {
            "$type": "Asi.Soa.Core.DataContracts.IdentityData, Asi.Contracts",
            "EntityTypeName": "Psc_Event_Session",
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
            "$values": data.session
          }
        }
    }
      
    let url =  `api/${this.envMode=='2017'?'Psc_Event_Session_2017' :'Psc_Event_Session'}`;
    // console.log(postSessionData)
    
    return this.httpClient.post(url, postSessionData, httpOptions).pipe(map((res: Sessions) => { return res; }));
  }

  private addFakedSession(data): Observable<Sessions> {
    let data1: Sessions = {
      "$type": "Asi.Soa.Core.DataContracts.GenericEntityData, Asi.Contracts",
      "EntityTypeName": "Psc_Event_Session",
      "PrimaryParentEntityTypeName": "Standalone",
      "Identity": {
        "$type": "Asi.Soa.Core.DataContracts.IdentityData, Asi.Contracts",
        "EntityTypeName": "Psc_Event_Session",
        "IdentityElements": {
          "$type": "System.Collections.ObjectModel.Collection`1[[System.String, mscorlib]], mscorlib",
          "$values": [
            "0"
          ]
        }
      },
      "PrimaryParentIdentity": {
        "$type": "Asi.Soa.Core.DataContracts.IdentityData, Asi.Contracts",
        "EntityTypeName": "Standalone",
        "IdentityElements": {
          "$type": "System.Collections.ObjectModel.Collection`1[[System.String, mscorlib]], mscorlib",
          "$values": [
            "0"
          ]
        }
      },
      "Properties": {
        "$type": "Asi.Soa.Core.DataContracts.GenericPropertyDataCollection, Asi.Contracts",
        "$values": [
          {
            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
            "Name": "Ordinal",
            "Value": {
              "$type": "System.Int32",
              "$value": 0
            }
          },
          {
            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
            "Name": "TotalUnallocated",
            "Value": {
              "$type": "System.Int32",
              "$value": 0
            }
          },
          {
            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
            "Name": "TotalAllocated",
            "Value": {
              "$type": "System.Int32",
              "$value": 0
            }
          },
          {
            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
            "Name": "TotalSeats",
            "Value": {
              "$type": "System.Int32",
              "$value": 0
            }
          },
          {
            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
            "Name": "TotalTables",
            "Value": {
              "$type": "System.Int32",
              "$value": 0
            }
          },
          {
            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
            "Name": "Programs",
            "Value": "WELCOME, Guests"
          },
          {
            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
            "Name": "SessionName",
            "Value": "Delegate Reception 5"
          },
          {
            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
            "Name": "EventID",
            "Value": "LDC11"
          }
        ]
      }
    }
    return of(data1).pipe(delay(500));
  }
  // add session ends



  // update session starts
  public updateSession(data): Observable<Sessions> {
    if (this.live) return this.updateLiveSession(data);
    else return this.updateFakedSession(data);
  }

  private updateLiveSession(data): Observable<Sessions> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
//  'RequestVerificationToken': this.token
'Authorization': `Bearer ${this.token}`
      })
    }
    let postSessionData = {}

    if(this.envMode=='2017' ){
      postSessionData = {
        "$type": "Asi.Soa.Core.DataContracts.GenericEntityData, Asi.Contracts",
        "EntityTypeName": "Psc_Event_Session_2017",
        "Properties": {
          "$type": "Asi.Soa.Core.DataContracts.GenericPropertyDataCollection, Asi.Contracts",
          "$values": data.session
        }
      }

    }else{
      postSessionData = {
        "$type": "Asi.Soa.Core.DataContracts.GenericEntityData, Asi.Contracts",
        "EntityTypeName": "Psc_Event_Session",
        "PrimaryParentEntityTypeName": "Standalone",
        "Identity": {
          "$type": "Asi.Soa.Core.DataContracts.IdentityData, Asi.Contracts",
          "EntityTypeName": "Psc_Event_Session",
          "IdentityElements": {
            "$type": "System.Collections.ObjectModel.Collection`1[[System.String, mscorlib]], mscorlib",
            "$values": [data.sessionID]
          }
        },
        "PrimaryParentIdentity": {
          "$type": "Asi.Soa.Core.DataContracts.IdentityData, Asi.Contracts",
          "EntityTypeName": "Standalone",
          "IdentityElements": {
            "$type": "System.Collections.ObjectModel.Collection`1[[System.String, mscorlib]], mscorlib",
            "$values": [data.sessionID]
          }
        },
        "Properties": {
          "$type": "Asi.Soa.Core.DataContracts.GenericPropertyDataCollection, Asi.Contracts",
          "$values": data.session
        }
      }
    }
// console.log(postSessionData)
    let url =  'api/Psc_Event_Session/' + data.sessionID;
    let url2017 =  'api/Psc_Event_Session_2017/~'+data.selectedPartyId+'|' + data.sessionID;
    // console.log(url2017)
    return this.httpClient.put(this.envMode == '2017'? url2017:url, postSessionData, httpOptions).pipe(map((res: Sessions) => { return res; }));
  }

  private updateFakedSession(data): Observable<Sessions> {
    let data1: Sessions = {
      "$type": "Asi.Soa.Core.DataContracts.GenericEntityData, Asi.Contracts",
      "EntityTypeName": "Psc_Event_Session",
      "PrimaryParentEntityTypeName": "Standalone",
      "Identity": {
        "$type": "Asi.Soa.Core.DataContracts.IdentityData, Asi.Contracts",
        "EntityTypeName": "Psc_Event_Session",
        "IdentityElements": {
          "$type": "System.Collections.ObjectModel.Collection`1[[System.String, mscorlib]], mscorlib",
          "$values": [
            "10"
          ]
        }
      },
      "PrimaryParentIdentity": {
        "$type": "Asi.Soa.Core.DataContracts.IdentityData, Asi.Contracts",
        "EntityTypeName": "Standalone",
        "IdentityElements": {
          "$type": "System.Collections.ObjectModel.Collection`1[[System.String, mscorlib]], mscorlib",
          "$values": [
            "10"
          ]
        }
      },
      "Properties": {
        "$type": "Asi.Soa.Core.DataContracts.GenericPropertyDataCollection, Asi.Contracts",
        "$values": [
          {
            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
            "Name": "Ordinal",
            "Value": {
              "$type": "System.Int32",
              "$value": 10
            }
          },
          {
            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
            "Name": "TotalUnallocated",
            "Value": {
              "$type": "System.Int32",
              "$value": 0
            }
          },
          {
            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
            "Name": "TotalAllocated",
            "Value": {
              "$type": "System.Int32",
              "$value": 0
            }
          },
          {
            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
            "Name": "TotalSeats",
            "Value": {
              "$type": "System.Int32",
              "$value": 0
            }
          },
          {
            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
            "Name": "TotalTables",
            "Value": {
              "$type": "System.Int32",
              "$value": 0
            }
          },
          {
            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
            "Name": "Programs",
            "Value": "ANNCONF/LEGIS, ANNCONF/GUESTGOLF"
          },
          {
            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
            "Name": "SessionName",
            "Value": "Delegate Reception 5"
          },
          {
            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
            "Name": "EventID",
            "Value": "LDC11"
          }
        ]
      }
    }
    return of(data1).pipe(delay(500));
  }
  // update session ends



  // delete session starts
  public deleteSession(sessionID,selectedPartyId): Observable<any> {
    if (this.live) return this.deleteLiveSession(sessionID,selectedPartyId);
    else return this.deleteFakedSession(sessionID);
  }

  private deleteLiveSession(sessionID,selectedPartyId): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
 'RequestVerificationToken': this.token
      })
    }
    let url =  'api/Psc_Event_Session/' + sessionID;
    let url2017=  `api/Psc_Event_Session_2017/~`+selectedPartyId+'|' + sessionID;
    return this.httpClient.delete(this.envMode == '2017'? url2017: url, this.httpOptions).pipe(map((res: any) => { return res; }));
  }

  private deleteFakedSession(sessionID): Observable<any> {
    return of("").pipe(delay(500));
  }
  // delete session ends



  // get tables starts
  public getTables(eventID): Observable<Sessions[]> {
    if (this.live) return this.getLiveTables(eventID);
    else return this.getFakedTables(eventID);
  }

  private getLiveTables(eventID): Observable<Sessions[]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
 'RequestVerificationToken': this.token
      })
    }
    let url =  `api/${this.envMode=='2017'?'Psc_Event_Table_2017' :'Psc_Event_Table'}?EventID=` + eventID;
    return this.httpClient.get(url, this.httpOptions)
      .pipe(map((res: any) => {
        return res.Items.$values
      }));
  }

  private getFakedTables(eventID): Observable<Sessions[]> {
    let data = [
      {
        "$type": "Asi.Soa.Core.DataContracts.GenericEntityData, Asi.Contracts",
        "EntityTypeName": "Psc_Event_Table",
        "PrimaryParentEntityTypeName": "Standalone",
        "Identity": {
          "$type": "Asi.Soa.Core.DataContracts.IdentityData, Asi.Contracts",
          "EntityTypeName": "Psc_Event_Table",
          "IdentityElements": {
            "$type": "System.Collections.ObjectModel.Collection`1[[System.String, mscorlib]], mscorlib",
            "$values": [
              "1"
            ]
          }
        },
        "PrimaryParentIdentity": {
          "$type": "Asi.Soa.Core.DataContracts.IdentityData, Asi.Contracts",
          "EntityTypeName": "Standalone",
          "IdentityElements": {
            "$type": "System.Collections.ObjectModel.Collection`1[[System.String, mscorlib]], mscorlib",
            "$values": [
              "1"
            ]
          }
        },
        "Properties": {
          "$type": "Asi.Soa.Core.DataContracts.GenericPropertyDataCollection, Asi.Contracts",
          "$values": [
            {
              "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
              "Name": "Ordinal",
              "Value": {
                "$type": "System.Int32",
                "$value": 1
              }
            },
            {
              "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
              "Name": "Colour",
              "Value": "#FF00EE"
            },
            {
              "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
              "Name": "NumSeats",
              "Value": {
                "$type": "System.Int32",
                "$value": 10
              }
            },
            {
              "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
              "Name": "TableName",
              "Value": "Ferns"
            },
            {
              "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
              "Name": "SessionID",
              "Value": {
                "$type": "System.Int32",
                "$value": 9
              }
            },
            {
              "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
              "Name": "EventID",
              "Value": "LDC11"
            }
          ]
        }
      },
      {
        "$type": "Asi.Soa.Core.DataContracts.GenericEntityData, Asi.Contracts",
        "EntityTypeName": "Psc_Event_Table",
        "PrimaryParentEntityTypeName": "Standalone",
        "Identity": {
          "$type": "Asi.Soa.Core.DataContracts.IdentityData, Asi.Contracts",
          "EntityTypeName": "Psc_Event_Table",
          "IdentityElements": {
            "$type": "System.Collections.ObjectModel.Collection`1[[System.String, mscorlib]], mscorlib",
            "$values": [
              "2"
            ]
          }
        },
        "PrimaryParentIdentity": {
          "$type": "Asi.Soa.Core.DataContracts.IdentityData, Asi.Contracts",
          "EntityTypeName": "Standalone",
          "IdentityElements": {
            "$type": "System.Collections.ObjectModel.Collection`1[[System.String, mscorlib]], mscorlib",
            "$values": [
              "2"
            ]
          }
        },
        "Properties": {
          "$type": "Asi.Soa.Core.DataContracts.GenericPropertyDataCollection, Asi.Contracts",
          "$values": [
            {
              "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
              "Name": "Ordinal",
              "Value": {
                "$type": "System.Int32",
                "$value": 2
              }
            },
            {
              "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
              "Name": "Colour",
              "Value": "#000000"
            },
            {
              "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
              "Name": "NumSeats",
              "Value": {
                "$type": "System.Int32",
                "$value": 15
              }
            },
            {
              "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
              "Name": "TableName",
              "Value": "Roses"
            },
            {
              "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
              "Name": "SessionID",
              "Value": {
                "$type": "System.Int32",
                "$value": 9
              }
            },
            {
              "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
              "Name": "EventID",
              "Value": "LDC11"
            }
          ]
        }
      },
      {
        "$type": "Asi.Soa.Core.DataContracts.GenericEntityData, Asi.Contracts",
        "EntityTypeName": "Psc_Event_Table",
        "PrimaryParentEntityTypeName": "Standalone",
        "Identity": {
          "$type": "Asi.Soa.Core.DataContracts.IdentityData, Asi.Contracts",
          "EntityTypeName": "Psc_Event_Table",
          "IdentityElements": {
            "$type": "System.Collections.ObjectModel.Collection`1[[System.String, mscorlib]], mscorlib",
            "$values": [
              "3"
            ]
          }
        },
        "PrimaryParentIdentity": {
          "$type": "Asi.Soa.Core.DataContracts.IdentityData, Asi.Contracts",
          "EntityTypeName": "Standalone",
          "IdentityElements": {
            "$type": "System.Collections.ObjectModel.Collection`1[[System.String, mscorlib]], mscorlib",
            "$values": [
              "3"
            ]
          }
        },
        "Properties": {
          "$type": "Asi.Soa.Core.DataContracts.GenericPropertyDataCollection, Asi.Contracts",
          "$values": [
            {
              "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
              "Name": "Ordinal",
              "Value": {
                "$type": "System.Int32",
                "$value": 3
              }
            },
            {
              "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
              "Name": "Colour",
              "Value": "#000FFF"
            },
            {
              "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
              "Name": "NumSeats",
              "Value": {
                "$type": "System.Int32",
                "$value": 10
              }
            },
            {
              "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
              "Name": "TableName",
              "Value": "Olives"
            },
            {
              "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
              "Name": "SessionID",
              "Value": {
                "$type": "System.Int32",
                "$value": 10
              }
            },
            {
              "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
              "Name": "EventID",
              "Value": "LDC11"
            }
          ]
        }
      }
    ]
    return of(data).pipe(delay(500));
  }
  // get tables ends



  // add table starts
  public addTable(data): Observable<Sessions> {
    if (this.live) return this.addLiveTable(data);
    else return this.addFakedTable(data);
  }

  private addLiveTable(data): Observable<Sessions> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
//  'RequestVerificationToken': this.token
'Authorization': `Bearer ${this.token}`
})
    }
    let postTableData = {}

    if(this.envMode=='2017'){
      postTableData = {
        "$type": "Asi.Soa.Core.DataContracts.GenericEntityData, Asi.Contracts",
        "EntityTypeName": "Psc_Event_Table_2017",
        "Properties": {
          "$type": "Asi.Soa.Core.DataContracts.GenericPropertyDataCollection, Asi.Contracts",
          "$values": data.table
        }
      }

    }else{
      postTableData = {
        "$type": "Asi.Soa.Core.DataContracts.GenericEntityData, Asi.Contracts",
        "EntityTypeName": "Psc_Event_Table",
        "PrimaryParentEntityTypeName": "Standalone",
        "Identity": {
          "$type": "Asi.Soa.Core.DataContracts.IdentityData, Asi.Contracts",
          "EntityTypeName": "Psc_Event_Table",
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
          "$values": data.table
        }
      }
    }
    // console.log('added table ',postTableData)
    let url =  `api/${this.envMode=='2017'?'Psc_Event_Table_2017' :'Psc_Event_Table'}`;
    return this.httpClient.post(url, postTableData, httpOptions).pipe(map((res: Sessions) => { return res; }));
  }

  private addFakedTable(data): Observable<Sessions> {
    let data1: Sessions = {
      "$type": "Asi.Soa.Core.DataContracts.GenericEntityData, Asi.Contracts",
      "EntityTypeName": "Psc_Event_Table",
      "PrimaryParentEntityTypeName": "Standalone",
      "Identity": {
        "$type": "Asi.Soa.Core.DataContracts.IdentityData, Asi.Contracts",
        "EntityTypeName": "Psc_Event_Table",
        "IdentityElements": {
          "$type": "System.Collections.ObjectModel.Collection`1[[System.String, mscorlib]], mscorlib",
          "$values": [
            "3"
          ]
        }
      },
      "PrimaryParentIdentity": {
        "$type": "Asi.Soa.Core.DataContracts.IdentityData, Asi.Contracts",
        "EntityTypeName": "Standalone",
        "IdentityElements": {
          "$type": "System.Collections.ObjectModel.Collection`1[[System.String, mscorlib]], mscorlib",
          "$values": [
            "3"
          ]
        }
      },
      "Properties": {
        "$type": "Asi.Soa.Core.DataContracts.GenericPropertyDataCollection, Asi.Contracts",
        "$values": [
          {
            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
            "Name": "Ordinal",
            "Value": {
              "$type": "System.Int32",
              "$value": 3
            }
          },
          {
            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
            "Name": "Colour",
            "Value": "#000FFF"
          },
          {
            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
            "Name": "NumSeats",
            "Value": {
              "$type": "System.Int32",
              "$value": 10
            }
          },
          {
            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
            "Name": "TableName",
            "Value": "Olives"
          },
          {
            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
            "Name": "SessionID",
            "Value": {
              "$type": "System.Int32",
              "$value": 2
            }
          },
          {
            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
            "Name": "EventID",
            "Value": "LDC11"
          }
        ]
      }
    }
    return of(data1).pipe(delay(500));
  }
  // add table ends



  // update table starts
  public updateTable(data): Observable<Sessions> {
    if (this.live) return this.updateLiveTable(data);
    else return this.updateFakedTable(data);
  }

  private updateLiveTable(data): Observable<Sessions> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
//  'RequestVerificationToken': this.token
'Authorization': `Bearer ${this.token}`
      })
    }
    let postSessionData = {
      
    }

    if(this.envMode=='2017'){
      postSessionData = {
        "$type": "Asi.Soa.Core.DataContracts.GenericEntityData, Asi.Contracts",
        "EntityTypeName": "Psc_Event_Table_2017",
        "Properties": {
          "$type": "Asi.Soa.Core.DataContracts.GenericPropertyDataCollection, Asi.Contracts",
          "$values": data.table
        }
      }

    }else{
      postSessionData = {
        "$type": "Asi.Soa.Core.DataContracts.GenericEntityData, Asi.Contracts",
        "EntityTypeName": "Psc_Event_Table",
        "PrimaryParentEntityTypeName": "Standalone",
        "Identity": {
          "$type": "Asi.Soa.Core.DataContracts.IdentityData, Asi.Contracts",
          "EntityTypeName": "Psc_Event_Table",
          "IdentityElements": {
            "$type": "System.Collections.ObjectModel.Collection`1[[System.String, mscorlib]], mscorlib",
            "$values": [data.tableID]
          }
        },
        "PrimaryParentIdentity": {
          "$type": "Asi.Soa.Core.DataContracts.IdentityData, Asi.Contracts",
          "EntityTypeName": "Standalone",
          "IdentityElements": {
            "$type": "System.Collections.ObjectModel.Collection`1[[System.String, mscorlib]], mscorlib",
            "$values": [data.tableID]
          }
        },
        "Properties": {
          "$type": "Asi.Soa.Core.DataContracts.GenericPropertyDataCollection, Asi.Contracts",
          "$values": data.table
        }
      }
    }
    let url =  `api/Psc_Event_Table/` + data.tableID;

    
    let url2017=  `api/Psc_Event_Table_2017/~`+data.selectedPartyId+'|' + data.tableID;

    return this.httpClient.put(this.envMode == '2017'? url2017:url, postSessionData, httpOptions).pipe(map((res: Sessions) => { return res; }));
  }

  private updateFakedTable(data): Observable<Sessions> {
    let data1: Sessions = {
      "$type": "Asi.Soa.Core.DataContracts.GenericEntityData, Asi.Contracts",
      "EntityTypeName": "Psc_Event_Table",
      "PrimaryParentEntityTypeName": "Standalone",
      "Identity": {
        "$type": "Asi.Soa.Core.DataContracts.IdentityData, Asi.Contracts",
        "EntityTypeName": "Psc_Event_Table",
        "IdentityElements": {
          "$type": "System.Collections.ObjectModel.Collection`1[[System.String, mscorlib]], mscorlib",
          "$values": ["3"]
        }
      },
      "PrimaryParentIdentity": {
        "$type": "Asi.Soa.Core.DataContracts.IdentityData, Asi.Contracts",
        "EntityTypeName": "Standalone",
        "IdentityElements": {
          "$type": "System.Collections.ObjectModel.Collection`1[[System.String, mscorlib]], mscorlib",
          "$values": ["3"]
        }
      },
      "Properties": {
        "$type": "Asi.Soa.Core.DataContracts.GenericPropertyDataCollection, Asi.Contracts",
        "$values": [
          {
            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
            "Name": "Ordinal",
            "Value": {
              "$type": "System.Int32",
              "$value": 3
            }
          },
          {
            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
            "Name": "Colour",
            "Value": "#000FFF"
          },
          {
            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
            "Name": "NumSeats",
            "Value": {
              "$type": "System.Int32",
              "$value": 10
            }
          },
          {
            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
            "Name": "TableName",
            "Value": "Olives"
          },
          {
            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
            "Name": "SessionID",
            "Value": {
              "$type": "System.Int32",
              "$value": 2
            }
          },
          {
            "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
            "Name": "EventID",
            "Value": "LDC11"
          }
        ]
      }
    }
    return of(data1).pipe(delay(500));
  }
  // update table ends



  // delete table starts
  public deleteTable(tableID,selectedPartyId): Observable<any> {
    if (this.live) return this.deleteLiveTable(tableID,selectedPartyId);
    else return this.deleteFakedTable(tableID);
  }

  private deleteLiveTable(tableID,selectedPartyId): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
 'RequestVerificationToken': this.token
      })
    }
    // console.log('delete 2')
    let url =  `api/Psc_Event_Table/` + tableID;
    let url2017=  `api/Psc_Event_Table_2017/~`+selectedPartyId+'|' + tableID;
    return this.httpClient.delete(this.envMode == '2017'? url2017: url, this.httpOptions).pipe(map((res: any) => { return res; }));
  }

  private deleteFakedTable(tableID): Observable<any> {
    return of("").pipe(delay(500));
  }
  // delete table ends



  // get session by timestamp starts
  public getSessionByTimeStamp(TimeStamp): Observable<Sessions[]> {
    if (this.live) return this.getLiveSessionByTimeStamp(TimeStamp);
    else return this.getFakedSessionByTimeStamp(TimeStamp);
  }

  private getLiveSessionByTimeStamp(TimeStamp): Observable<Sessions[]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
 'RequestVerificationToken': this.token
      })
    }
    let url =  `api/${this.envMode=='2017'?'Psc_Event_Session_2017' :'Psc_Event_Session'}?SessionTimeStamp=` + TimeStamp;
    return this.httpClient.get(url, this.httpOptions)
      .pipe(map((res: any) => {
        return res.Items.$values
      }));
  }

  private getFakedSessionByTimeStamp(TimeStamp): Observable<Sessions[]> {
    let data = [
      {
        "$type": "Asi.Soa.Core.DataContracts.GenericEntityData, Asi.Contracts",
        "EntityTypeName": "Psc_Event_Session",
        "PrimaryParentEntityTypeName": "Standalone",
        "Identity": {
          "$type": "Asi.Soa.Core.DataContracts.IdentityData, Asi.Contracts",
          "EntityTypeName": "Psc_Event_Session",
          "IdentityElements": {
            "$type": "System.Collections.ObjectModel.Collection`1[[System.String, mscorlib]], mscorlib",
            "$values": [
              "9"
            ]
          }
        },
        "PrimaryParentIdentity": {
          "$type": "Asi.Soa.Core.DataContracts.IdentityData, Asi.Contracts",
          "EntityTypeName": "Standalone",
          "IdentityElements": {
            "$type": "System.Collections.ObjectModel.Collection`1[[System.String, mscorlib]], mscorlib",
            "$values": [
              "9"
            ]
          }
        },
        "Properties": {
          "$type": "Asi.Soa.Core.DataContracts.GenericPropertyDataCollection, Asi.Contracts",
          "$values": [
            {
              "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
              "Name": "Ordinal",
              "Value": {
                "$type": "System.Int32",
                "$value": 9
              }
            },
            {
              "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
              "Name": "SessionTimeStamp",
              "Value": "1584444423"
            },
            {
              "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
              "Name": "EventID",
              "Value": "LDC11"
            },
            {
              "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
              "Name": "Programs",
              "Value": "ANNCONF/GALA"
            },
            {
              "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
              "Name": "SessionName",
              "Value": "Delegate Reception 3"
            },
            {
              "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
              "Name": "TotalAllocated",
              "Value": {
                "$type": "System.Int32",
                "$value": 0
              }
            },
            {
              "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
              "Name": "TotalSeats",
              "Value": {
                "$type": "System.Int32",
                "$value": 0
              }
            },
            {
              "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
              "Name": "TotalTables",
              "Value": {
                "$type": "System.Int32",
                "$value": 0
              }
            },
            {
              "$type": "Asi.Soa.Core.DataContracts.GenericPropertyData, Asi.Contracts",
              "Name": "TotalUnallocated",
              "Value": {
                "$type": "System.Int32",
                "$value": 0
              }
            }
          ]
        }
      }
    ]
    return of(data).pipe(delay(500));
  }
  // get session by timestamp ends



  getTableFunction(eventKey): Observable<any>{
      let url = `api/iqa?QueryName=$/Pseudocode/SeatPlanner/Pseudocode - Table Functions&parameter=${eventKey}&Limit=500`;
      return this.httpClient.get(url, this.httpOptions)
    
  }


  getIQARegistrantsTableGuest(programs): Observable<IQARegistrant[]> {
    
  
    let allRegistrants: IQARegistrant[] = [];
  
    const fetchBatch = (offset = 0, totalCount = 0): Observable<IQARegistrant[]> => {
      let url = `api/iqa?QueryName=$/Pseudocode/SeatPlanner/Pseudocode - Registrants by Program Table Guests&parameter=${programs}&Limit=500&Offset=${offset}`;
  
      return this.httpClient.get(url, this.httpOptions).pipe(
        map((res: any) => ({
          registrants: res.Items?.$values || [],
          totalCount: res.TotalCount || 0
        })),
        mergeMap(({ registrants, totalCount }) => {
          allRegistrants = [...allRegistrants, ...registrants];
  
          if (totalCount > allRegistrants.length) {
            // Fetch next batch if totalCount is greater than fetched count
            return fetchBatch(offset + 500, totalCount);
          } else {
            return of(allRegistrants);
          }
        })
      );
    };
  
    return fetchBatch();
  }



  // get registrants from IQA query starts
  public getIQARegistrants(programs): Observable<IQARegistrant[]> {
    if (this.live) return this.getIQALiveRegistrants(programs);
    else return this.getIQAFakedRegistrants(programs);
  }

//   private getIQALiveRegistrants(programs): Observable<IQARegistrant[]> {
//     const httpOptions = {
//       headers: new HttpHeaders({
//         'Content-Type': 'application/json',
//  'RequestVerificationToken': this.token
//       })
//     }
//     let url =  'api/iqa?QueryName=$/PseudoCode/SeatPlanner/Pseudocode - Registrants by Program&parameter=' + programs + "&Limit=500";
//     // console.log(url);
//     return this.httpClient.get(url, this.httpOptions)
//       .pipe(map((res: any) => {
//         return res.Items.$values
//       }));
//   }



  private getIQALiveRegistrants(programs): Observable<IQARegistrant[]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'RequestVerificationToken': this.token
      })
    };
  
    let allRegistrants: IQARegistrant[] = [];
  
    const fetchBatch = (offset = 0, totalCount = 0): Observable<IQARegistrant[]> => {
      let url = `api/iqa?QueryName=$/PseudoCode/SeatPlanner/Pseudocode - Registrants by Program&parameter=${programs}&Limit=500&Offset=${offset}`;
  
      return this.httpClient.get(url, this.httpOptions).pipe(
        map((res: any) => ({
          registrants: res.Items?.$values || [],
          totalCount: res.TotalCount || 0
        })),
        mergeMap(({ registrants, totalCount }) => {
          allRegistrants = [...allRegistrants, ...registrants];
  
          
          if (totalCount > allRegistrants.length) {
            // Fetch next batch if totalCount is greater than fetched count
            return fetchBatch(offset + 500, totalCount);
          } else {
            return of(allRegistrants);
          }
        })
      );
    };
  
    return fetchBatch();
  }
  
  



  private getIQAFakedRegistrants(programs): Observable<IQARegistrant[]> {
    let data = []
    return of(data).pipe(delay(500));
  }
  // get registrants from IQA query ends



  // add registrant starts
  public addRegistrant(data): Observable<Sessions> {
    if (this.live) return this.addLiveRegistrant(data);
    else return this.addFakedRegistrant(data);
  }

  private addLiveRegistrant(data): Observable<Sessions> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
//  'RequestVerificationToken': this.token
'Authorization': `Bearer ${this.token}`
      })
    }
    let url =  `api/${this.envMode=='2017'?'Psc_Event_Registrant_2017' :'Psc_Event_Registrant'}`;
    // console.log('add new data',data)
    return this.httpClient.post(url, data, httpOptions).pipe(map((res: Sessions) => { return res; }));
  }

  private addFakedRegistrant(data): Observable<Sessions> {
    return of(data).pipe(delay(500));
  }
  // add registrant starts



  // get registrants starts
  public getRegistrants(eventID, sessionID = null): Observable<Sessions[]> {
    if (this.live) return this.getLiveRegistrants(eventID, sessionID);
    else return this.getFakedRegistrants(eventID, sessionID);
  }

//   private getLiveRegistrants(eventID, sessionID): Observable<Sessions[]> {
//     const httpOptions = {
//       headers: new HttpHeaders({
//         'Content-Type': 'application/json',
// 'RequestVerificationToken': this.token
//       })
//     }
//     let url;
//     if (sessionID)
//       url =  `api/${this.envMode=='2017'?'Psc_Event_Registrant_2017' :'Psc_Event_Registrant'}?EventID=` + eventID + '&SessionID=' + sessionID + '&Limit=500';
//     else
//       url =  `api/${this.envMode=='2017'?'Psc_Event_Registrant_2017' :'Psc_Event_Registrant'}?EventID=` + eventID + '&Limit=500';
//     return this.httpClient.get(url, this.httpOptions)
//       .pipe(map((res: any) => {
//         return res.Items.$values
//       }));
//   }



  private getLiveRegistrants(eventID, sessionID = null): Observable<Sessions[]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'RequestVerificationToken': this.token
      })
    };
  
    let allRegistrants: Sessions[] = [];
  
    const fetchBatch = (offset = 0, totalCount = 0): Observable<Sessions[]> => {
      // let url = `api/iqa?QueryName=$/PseudoCode/SeatPlanner/Pseudocode - Registrants by Program&parameter=${programs}&Limit=500&Offset=${offset}`;
  

      let url='';
    if (sessionID)
      url =  `api/${this.envMode=='2017'?'Psc_Event_Registrant_2017' :'Psc_Event_Registrant'}?EventID=${eventID}&SessionID=${sessionID}&Limit=500&Offset=${offset}`;
    else
      url =  `api/${this.envMode=='2017'?'Psc_Event_Registrant_2017' :'Psc_Event_Registrant'}?EventID=${eventID}&Limit=500&Offset=${offset}`;


      return this.httpClient.get(url, this.httpOptions).pipe(
        map((res: any) => ({
          registrants: res.Items?.$values || [],
          totalCount: res.TotalCount || 0
        })),
        mergeMap(({ registrants, totalCount }) => {
          allRegistrants = [...allRegistrants, ...registrants];
  
          if (totalCount > allRegistrants.length) {
            // Fetch next batch if totalCount is greater than fetched count
            return fetchBatch(offset + 500, totalCount);
          } else {
            return of(allRegistrants);
          }
        })
      );
    };
  
    return fetchBatch();
  }

  private getFakedRegistrants(eventID, sessionID): Observable<Sessions[]> {
    let data = []
    return of(data).pipe(delay(500));
  }
  // get registrants starts




  // update registrant starts
  public updateRegistrant(data,selectedPartyId): Observable<Sessions> {
    if (this.live) return this.updateLiveRegistrant(data,selectedPartyId);
    else return this.updateFakedRegistrant(data);
  }

  private updateLiveRegistrant(data,selectedPartyId): Observable<Sessions> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
// 'RequestVerificationToken': this.token
'Authorization': `Bearer ${this.token}`
})
    }

    let postRegistrantData = {}
    if(this.envMode=='2017'){
      postRegistrantData = {
        "$type": "Asi.Soa.Core.DataContracts.GenericEntityData, Asi.Contracts",
        "EntityTypeName": "Psc_Event_Registrant_2017",
        
        "Properties": {
          "$type": "Asi.Soa.Core.DataContracts.GenericPropertyDataCollection, Asi.Contracts",
          "$values": data.registrant
        }
      }

    }else{
      postRegistrantData = {
        "$type": "Asi.Soa.Core.DataContracts.GenericEntityData, Asi.Contracts",
        "EntityTypeName": "Psc_Event_Registrant",
        "PrimaryParentEntityTypeName": "Standalone",
        "Identity": {
          "$type": "Asi.Soa.Core.DataContracts.IdentityData, Asi.Contracts",
          "EntityTypeName": "Psc_Event_Registrant",
          "IdentityElements": {
            "$type": "System.Collections.ObjectModel.Collection`1[[System.String, mscorlib]], mscorlib",
            "$values": [data.registrantID]
          }
        },
        "PrimaryParentIdentity": {
          "$type": "Asi.Soa.Core.DataContracts.IdentityData, Asi.Contracts",
          "EntityTypeName": "Standalone",
          "IdentityElements": {
            "$type": "System.Collections.ObjectModel.Collection`1[[System.String, mscorlib]], mscorlib",
            "$values": [data.registrantID]
          }
        },
        "Properties": {
          "$type": "Asi.Soa.Core.DataContracts.GenericPropertyDataCollection, Asi.Contracts",
          "$values": data.registrant
        }
      }
    }
    let url =  `api/Psc_Event_Registrant/` + data.registrantID;
    
    let url2017=  `api/Psc_Event_Registrant_2017/~`+selectedPartyId+'|' +  data.registrantID;
    // console.log('update registant',postRegistrantData)
    return this.httpClient.put(this.envMode=='2017'? url2017: url, postRegistrantData, httpOptions).pipe(map((res: Sessions) => { return res; }));
  }

  private updateFakedRegistrant(data): Observable<Sessions> {
    return of(data).pipe(delay(500));
  }
  // update session ends



  // delete registrant starts
  public deleteRegistrant(registrantID,selectedPartyId): Observable<any> {
    if (this.live) return this.deleteLiveRegistrant(registrantID,selectedPartyId);
    else return this.deleteFakedRegistrant(registrantID);
  }

  private deleteLiveRegistrant(registrantID,selectedPartyId): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
'RequestVerificationToken': this.token
      })
    }
    // let url =  `api/${this.envMode=='2017'?'Psc_Event_Registrant_2017' :'Psc_Event_Registrant'}/` + registrantID;

    let url =  `api/Psc_Event_Registrant/` + registrantID;
    
    let url2017=  `api/Psc_Event_Registrant_2017/~`+selectedPartyId+'|' +  registrantID;
    return this.httpClient.delete(this.envMode=='2017'? url2017: url, this.httpOptions).pipe(map((res: any) => { return res; }));
  }

  private deleteFakedRegistrant(registrantID): Observable<any> {
    return of("").pipe(delay(500));
  }
  // delete registrant ends
}
