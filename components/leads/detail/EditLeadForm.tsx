import { PrimaryButton } from '../new/PrimaryButton';
import { SelectInput } from '../new/SelectInput';
import { TextArea } from '../new/TextArea';
import { TextInput } from '../new/TextInput';
import { EditLeadForm as EditLeadFormType } from './types';

const statusOptions = [
  { label: 'NEW_LEAD', value: 'NEW_LEAD' },
  { label: 'FOLLOW_UP', value: 'FOLLOW_UP' },
  { label: 'NEGOTIATING', value: 'NEGOTIATING' },
  { label: 'WON', value: 'WON' },
  { label: 'LOST', value: 'LOST' },
  { label: 'CLOSED', value: 'CLOSED' }
];

const codeSelect = (label: string, values: Array<{ label: string; value: string }>) => [{ label, value: '' }, ...values];

const priceRangeOptions = codeSelect('Select price range', [
  { label: '20,000-40,000 THB', value: 'PR_20_40K' },
  { label: '40,001-70,000 THB', value: 'PR_40_70K' }
]);
const usageTimingOptions = codeSelect('Select usage timing', [
  { label: 'Immediate (0-1 month)', value: 'USE_IMMEDIATE' },
  { label: 'Within 3-6 months', value: 'USE_3_6M' }
]);
const residenceTypeOptions = codeSelect('Select residence type', [
  { label: 'Condo', value: 'RES_CONDO' },
  { label: 'House', value: 'RES_HOUSE' }
]);
const customerGroupOptions = codeSelect('Select customer group', [
  { label: 'Newly-wed', value: 'CG_NEWLYWED' },
  { label: 'Family with kids', value: 'CG_FAMILY' }
]);
const ageRangeOptions = codeSelect('Select age range', [
  { label: '25-34', value: 'AGE_25_34' },
  { label: '35-44', value: 'AGE_35_44' }
]);
const customerTypeOptions = codeSelect('Select customer type', [
  { label: 'First-time buyer', value: 'CTF_FIRST_TIME' },
  { label: 'Replacement buyer', value: 'CTF_REPLACE' }
]);
const productCategoryOptions = codeSelect('Select product category', [
  { label: 'Sofa Set', value: 'CAT_SOFA_SET' },
  { label: 'Recliner', value: 'CAT_RECLINER' }
]);

type Props = {
  form: EditLeadFormType;
  onChange: (key: keyof EditLeadFormType, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
};

export function EditLeadForm({ form, onChange, onSave, onCancel, saving }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <SelectInput label="Status" value={form.status} onChange={(v) => onChange('status', v)} options={statusOptions} />
        <TextInput label="Customer Name" value={form.customerName} onChange={(v) => onChange('customerName', v)} />
        <TextInput label="Phone" value={form.phone} onChange={(v) => onChange('phone', v)} />
        <TextInput label="LINE ID" value={form.lineId} onChange={(v) => onChange('lineId', v)} />
        <TextInput label="Interested Model" value={form.interestedModelCode} onChange={(v) => onChange('interestedModelCode', v)} />
        <SelectInput label="Price Range" value={form.priceRangeCode} onChange={(v) => onChange('priceRangeCode', v)} options={priceRangeOptions} />
        <SelectInput label="Usage Timing" value={form.usageTimingCode} onChange={(v) => onChange('usageTimingCode', v)} options={usageTimingOptions} />
        <SelectInput label="Residence Type" value={form.residenceTypeCode} onChange={(v) => onChange('residenceTypeCode', v)} options={residenceTypeOptions} />
        <SelectInput label="Customer Group" value={form.customerGroupCode} onChange={(v) => onChange('customerGroupCode', v)} options={customerGroupOptions} />
        <SelectInput label="Age Range" value={form.ageRangeCode} onChange={(v) => onChange('ageRangeCode', v)} options={ageRangeOptions} />
        <TextInput label="Customer Location" value={form.customerLocation} onChange={(v) => onChange('customerLocation', v)} />
        <TextInput label="First Question" value={form.firstQuestion} onChange={(v) => onChange('firstQuestion', v)} />
        <SelectInput label="Customer Type" value={form.customerTypeFlagCode} onChange={(v) => onChange('customerTypeFlagCode', v)} options={customerTypeOptions} />
        <SelectInput label="Product Category" value={form.interestedProductCategoryCode} onChange={(v) => onChange('interestedProductCategoryCode', v)} options={productCategoryOptions} />
      </div>
      <TextArea label="Note" value={form.note} onChange={(v) => onChange('note', v)} />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl border border-[#CDB89F] px-4 text-sm font-medium text-[#5A4A3B]"
        >
          Cancel
        </button>
        <PrimaryButton type="button" onClick={onSave} disabled={saving} className="flex-1">
          {saving ? 'Saving...' : 'Save Changes'}
        </PrimaryButton>
      </div>
    </div>
  );
}
