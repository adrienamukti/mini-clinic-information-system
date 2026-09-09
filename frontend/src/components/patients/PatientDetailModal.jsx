import {
    Pencil,
    X,
} from 'lucide-react';

const PatientDetailModal = ({
    patient,
    loading,
    canManage,
    onEdit,
    onClose,
}) => {
    if (!patient && !loading) {
        return null;
    }

    const formatDate = (value) => {
        if (!value) {
            return '-';
        }

        return new Intl.DateTimeFormat(
            'id-ID',
            {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                timeZone: 'UTC',
            }
        ).format(new Date(value));
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-card">
                <div className="modal-header">
                    <div>
                        <span className="page-eyebrow">
                            Detail
                        </span>
                        <h2>Data Pasien</h2>
                    </div>

                    <button
                        type="button"
                        className="modal-close"
                        onClick={onClose}
                    >
                        <X size={20} />
                    </button>
                </div>

                {loading ? (
                    <div className="modal-loading">
                        Memuat data pasien...
                    </div>
                ) : (
                    <>
                        <div className="patient-detail-grid">
                            <div>
                                <span>No. Rekam Medis</span>
                                <strong>
                                    {
                                        patient.medical_record_number
                                    }
                                </strong>
                            </div>

                            <div>
                                <span>NIK</span>
                                <strong>
                                    {patient.nik}
                                </strong>
                            </div>

                            <div>
                                <span>Nama Pasien</span>
                                <strong>
                                    {patient.name}
                                </strong>
                            </div>

                            <div>
                                <span>Jenis Kelamin</span>
                                <strong>
                                    {patient.gender}
                                </strong>
                            </div>

                            <div>
                                <span>Tanggal Lahir</span>
                                <strong>
                                    {formatDate(
                                        patient.date_of_birth
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>Telepon</span>
                                <strong>
                                    {patient.phone || '-'}
                                </strong>
                            </div>

                            <div className="detail-full">
                                <span>Alamat</span>
                                <strong>
                                    {
                                        patient.address ||
                                        '-'
                                    }
                                </strong>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={onClose}
                            >
                                Tutup
                            </button>

                            {canManage && (
                                <button
                                    type="button"
                                    className="primary-button"
                                    onClick={() =>
                                        onEdit(patient)
                                    }
                                >
                                    <Pencil size={17} />
                                    Ubah Data
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default PatientDetailModal;