import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const initialForm = {
    nik: '',
    name: '',
    gender: '',
    date_of_birth: '',
    phone: '',
    address: '',
};

const PatientFormModal = ({
    open,
    mode,
    patient,
    loading,
    serverErrors,
    onClose,
    onSubmit,
}) => {
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!open) {
            return;
        }

        if (mode === 'edit' && patient) {
            setForm({
                nik: patient.nik || '',
                name: patient.name || '',
                gender: patient.gender || '',
                date_of_birth:
                    patient.date_of_birth
                        ? String(
                              patient.date_of_birth
                          ).slice(0, 10)
                        : '',
                phone: patient.phone || '',
                address: patient.address || '',
            });
        } else {
            setForm(initialForm);
        }

        setErrors({});
    }, [open, mode, patient]);

    if (!open) {
        return null;
    }

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));

        setErrors((previous) => ({
            ...previous,
            [name]: '',
        }));
    };

    const validate = () => {
        const newErrors = {};

        if (!/^\d{16}$/.test(form.nik)) {
            newErrors.nik =
                'NIK harus terdiri dari 16 digit.';
        }

        if (!form.name.trim()) {
            newErrors.name =
                'Nama pasien wajib diisi.';
        }

        if (
            ![
                'Laki-laki',
                'Perempuan',
            ].includes(form.gender)
        ) {
            newErrors.gender =
                'Jenis kelamin wajib dipilih.';
        }

        if (!form.date_of_birth) {
            newErrors.date_of_birth =
                'Tanggal lahir wajib diisi.';
        } else {
            const birthDate =
                new Date(form.date_of_birth);

            if (birthDate > new Date()) {
                newErrors.date_of_birth =
                    'Tanggal lahir tidak boleh di masa depan.';
            }
        }

        if (
            form.phone &&
            !/^[0-9+\-\s]{8,20}$/.test(
                form.phone
            )
        ) {
            newErrors.phone =
                'Nomor telepon tidak valid.';
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!validate()) {
            return;
        }

        onSubmit({
            ...form,
            nik: form.nik.trim(),
            name: form.name.trim(),
            phone: form.phone.trim(),
            address: form.address.trim(),
        });
    };

    const getError = (field) =>
        errors[field] ||
        serverErrors?.[field] ||
        '';

    return (
        <div className="modal-backdrop">
            <div className="modal-card patient-form-modal">
                <div className="modal-header">
                    <div>
                        <span className="page-eyebrow">
                            Master Data
                        </span>

                        <h2>
                            {mode === 'edit'
                                ? 'Ubah Data Pasien'
                                : 'Tambah Pasien'}
                        </h2>
                    </div>

                    <button
                        type="button"
                        className="modal-close"
                        onClick={onClose}
                        disabled={loading}
                    >
                        <X size={20} />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="patient-form"
                >
                    <div className="form-grid">
                        <div className="form-group">
                            <label>NIK</label>

                            <input
                                name="nik"
                                value={form.nik}
                                onChange={handleChange}
                                maxLength={16}
                                placeholder="16 digit NIK"
                            />

                            {getError('nik') && (
                                <span className="field-error">
                                    {getError('nik')}
                                </span>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Nama Pasien</label>

                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Nama lengkap pasien"
                            />

                            {getError('name') && (
                                <span className="field-error">
                                    {getError('name')}
                                </span>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Jenis Kelamin</label>

                            <select
                                name="gender"
                                value={form.gender}
                                onChange={handleChange}
                            >
                                <option value="">
                                    Pilih jenis kelamin
                                </option>
                                <option value="Laki-laki">
                                    Laki-laki
                                </option>
                                <option value="Perempuan">
                                    Perempuan
                                </option>
                            </select>

                            {getError('gender') && (
                                <span className="field-error">
                                    {getError('gender')}
                                </span>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Tanggal Lahir</label>

                            <input
                                type="date"
                                name="date_of_birth"
                                value={
                                    form.date_of_birth
                                }
                                onChange={handleChange}
                            />

                            {getError(
                                'date_of_birth'
                            ) && (
                                <span className="field-error">
                                    {getError(
                                        'date_of_birth'
                                    )}
                                </span>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Nomor Telepon</label>

                            <input
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                placeholder="08xxxxxxxxxx"
                            />

                            {getError('phone') && (
                                <span className="field-error">
                                    {getError('phone')}
                                </span>
                            )}
                        </div>

                        <div className="form-group form-group-full">
                            <label>Alamat</label>

                            <textarea
                                name="address"
                                value={form.address}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Alamat pasien"
                            />

                            {getError('address') && (
                                <span className="field-error">
                                    {getError('address')}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Batal
                        </button>

                        <button
                            type="submit"
                            className="primary-button"
                            disabled={loading}
                        >
                            {loading
                                ? 'Menyimpan...'
                                : mode === 'edit'
                                  ? 'Simpan Perubahan'
                                  : 'Tambah Pasien'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PatientFormModal;