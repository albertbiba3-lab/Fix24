import { useEffect, useState } from 'react';
import { friendlyError } from './utils';
export function useLoad(loader, dependencies = []) {
  const [state, setState] = useState({ data: null, loading: true, error: '' });
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) setState(s => ({ ...s, loading: true, error: '' }));
      return loader();
    }).then(data => { if (active) setState({ data, loading: false, error: '' }); })
      .catch(error => { if (active) setState({ data: null, loading: false, error: friendlyError(error) }); });
    return () => { active = false; };
    // Callers supply the identity of the data they load, not an unstable inline callback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, version]);
  return { ...state, reload: () => setVersion(v => v + 1) };
}
