import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Diagnosis, Motorcycle, Status, TechnicalRecord, motorcycles } from "./types";
import { fullSeedRecords } from "./seed.generated";
import { fan1502015Update, falcon4002013Update, bros1502009Update, bros1602015Update, bros1602017Update, bros1602018Update, pop110i2015Update, titan1502009Update, titan150Mix2009Update, titan1502011Update, titan1502014Update, titan1602016Update, titan1602018Update, titan1602022Update } from "./user-updates";

type Audit = { id: number; text: string; date: string };
type State = { records: TechnicalRecord[]; diagnoses: Diagnosis[]; audit: Audit[]; customMotorcycles: Motorcycle[] };
type ContextValue = State & { ready: boolean; allMotorcycles: Motorcycle[]; saveDiagnosis: (d: Omit<Diagnosis, "id" | "data">) => void; saveRecord: (r: TechnicalRecord) => void; setRecordStatus: (id: number, status: Status) => void; removeDiagnosis: (id: number) => void; addMotorcycle: (m: Omit<Motorcycle, "id" | "page">) => void };
const KEY = "motodiag-v1";
const bundledRecords = [...fullSeedRecords, ...fan1502015Update, ...falcon4002013Update, ...bros1502009Update, ...bros1602015Update, ...bros1602017Update, ...bros1602018Update, ...pop110i2015Update, ...titan1502009Update, ...titan150Mix2009Update, ...titan1502011Update, ...titan1502014Update, ...titan1602016Update, ...titan1602018Update, ...titan1602022Update];
const initial: State = { records: bundledRecords, diagnoses: [], audit: [], customMotorcycles: [] };
const StoreContext = createContext<ContextValue | null>(null);
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(initial);
  const [ready, setReady] = useState(false);
  const reportedStorageError = useRef(false);
  useEffect(() => { AsyncStorage.getItem(KEY).then(raw => { if (raw) { try { const saved = JSON.parse(raw) as State; const known = new Set((saved.records ?? []).map(r => r.id)); setState({ ...initial, ...saved, records: [...bundledRecords.filter(r => !known.has(r.id)), ...(saved.records ?? [])] }); } catch { setState(s => ({ ...s, audit: [{ id: Date.now(), text: "Não foi possível ler a base local", date: new Date().toLocaleString("pt-BR") }, ...s.audit] })); } } setReady(true); }).catch(() => { setState(s => ({ ...s, audit: [{ id: Date.now(), text: "Não foi possível acessar o armazenamento local", date: new Date().toLocaleString("pt-BR") }, ...s.audit] })); setReady(true); }); }, []);
  useEffect(() => { if (ready) AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => { if (!reportedStorageError.current) { reportedStorageError.current = true; setState(s => ({ ...s, audit: [{ id: Date.now(), text: "Falha ao salvar no aparelho", date: new Date().toLocaleString("pt-BR") }, ...s.audit] })); } }); }, [state, ready]);
  const value = useMemo<ContextValue>(() => ({ ...state, ready, allMotorcycles: [...motorcycles, ...state.customMotorcycles], saveDiagnosis: d => setState(s => ({ ...s, diagnoses: [{ ...d, id: Date.now(), data: new Date().toLocaleString("pt-BR") }, ...s.diagnoses] })), saveRecord: r => setState(s => ({ ...s, records: [...s.records.filter(x => x.id !== r.id), r], audit: [{ id: Date.now(), text: `${r.componente || "Registro"} salvo`, date: new Date().toLocaleString("pt-BR") }, ...s.audit] })), setRecordStatus: (id, status) => setState(s => { const old = s.records.find(r => r.id === id); return { ...s, records: s.records.map(r => r.id === id ? { ...r, status } : r), audit: [{ id: Date.now(), text: `${old?.componente ?? "Registro"}: ${old?.status} → ${status}`, date: new Date().toLocaleString("pt-BR") }, ...s.audit] }; }), removeDiagnosis: id => setState(s => ({ ...s, diagnoses: s.diagnoses.filter(d => d.id !== id) })), addMotorcycle: m => setState(s => ({ ...s, customMotorcycles: [...s.customMotorcycles, { ...m, id: 1000 + s.customMotorcycles.length, page: "local" }] })) }), [state, ready]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
export function useStore() { const value = useContext(StoreContext); if (!value) throw new Error("useStore must be used inside StoreProvider"); return value; }
