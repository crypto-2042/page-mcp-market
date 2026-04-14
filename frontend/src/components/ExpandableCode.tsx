import { useState } from 'react';
import { useI18n } from '../i18n/I18nProvider';

interface ExpandableCodeProps {
  label: string;
  content: string;
}

export function ExpandableCode({ label, content }: ExpandableCodeProps) {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();

  return (
    <div className={open ? 'expandable-code is-open' : 'expandable-code'}>
      <div className="expandable-code__header">
        <span className="expandable-code__label">{label}</span>
        <button className="expandable-code__toggle" onClick={() => setOpen((value) => !value)} type="button">
          {open ? t('common.hide') : t('common.show')}
        </button>
      </div>
      {open ? (
        <pre className="expandable-code__body">
          <code>{content}</code>
        </pre>
      ) : null}
    </div>
  );
}
