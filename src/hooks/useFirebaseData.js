import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";

// Hook para contar documentos com filtro opcional
const useCollectionCount = (collectionName, filter = null) => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ref = collection(db, collectionName);
        const q = filter ? query(ref, where(filter.field, "==", filter.value)) : ref;
        const snapshot = await getDocs(q);
        setCount(snapshot.size);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [collectionName, filter]);

  return { count, loading, error };
};

// Hook para somar valores de um campo específico
const useTotalSum = (collectionName, fieldName) => {
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snapshot = await getDocs(collection(db, collectionName));
        let sum = 0;
        snapshot.forEach((doc) => {
          const value = doc.data()[fieldName];
          const parsed = typeof value === "number" ? value : parseFloat(value);
          sum += isNaN(parsed) ? 0 : parsed;
        });
        setTotal(sum);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [collectionName, fieldName]);

  return { total, loading, error };
};

export { useCollectionCount, useTotalSum };
