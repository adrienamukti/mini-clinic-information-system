import {
    ChevronLeft,
    ChevronRight,
    Eye,
    Pencil,
    Plus,
    Search,
    Trash2,
    Users,
} from 'lucide-react';

import {
    useEffect,
    useState,
} from 'react';

import api from '../services/api';
import { useAuth } from '../context/AuthContext';

import PatientFormModal from
    '../components/patients/PatientFormModal';

import PatientDetailModal from
    '../components/patients/PatientDetailModal';

const PatientPage = () => {
    const { user } = useAuth();

    const [patients, setPatients] = useState([]);
    const [search, setSearch] = useState('');
    const [keyword, setKeyword] = useState('');
    const [page, setPage] = useState(1);

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formMode, setFormMode] =
        useState(null);

    const [selectedPatient, setSelectedPatient] =
        useState(null);

    const [detailPatient, setDetailPatient] =
        useState(null);

    const [detailLoading, setDetailLoading] =
        useState(false);

    const [saving, setSaving] =
        useState(false);

    const [serverErrors, setServerErrors] =
        useState({});

    const [deletePatient, setDeletePatient] =
        useState(null);

    const [deleting, setDeleting] =
        useState(false);

    const canManagePatients = [
        'Administrator',
        'Petugas Pendaftaran',
    ].includes(user?.role);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await api.get(
                '/patients',
                {
                    params: {
                        page,
                        limit: 10,
                        search:
                            keyword || undefined,
                    },
                }
            );

            const payload = response.data.data;

            const patientData =
                Array.isArray(payload)
                    ? payload
                    : payload?.patients ||
                      payload?.data ||
                      [];

            const paginationData =
                payload?.pagination || {};

            setPatients(patientData);

            setPagination({
                page:
                    paginationData.page ??
                    paginationData.current_page ??
                    page,

                limit:
                    paginationData.limit ?? 10,

                total:
                    paginationData.total ??
                    patientData.length,

                totalPages:
                    paginationData.totalPages ??
                    paginationData.total_pages ??
                    1,
            });
        } catch (error) {
            setError(
                error.response?.data?.message ||
                    'Gagal mengambil data pasien.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, [page, keyword]);

    const showSuccess = (message) => {
        setSuccess(message);

        window.setTimeout(() => {
            setSuccess('');
        }, 3000);
    };

    const handleSearch = (event) => {
        event.preventDefault();

        setPage(1);
        setKeyword(search.trim());
    };

    const handleResetSearch = () => {
        setSearch('');
        setKeyword('');
        setPage(1);
    };

    const openCreateModal = () => {
        setSelectedPatient(null);
        setServerErrors({});
        setFormMode('create');
    };

    const openEditModal = (patient) => {
        setDetailPatient(null);
        setSelectedPatient(patient);
        setServerErrors({});
        setFormMode('edit');
    };

    const closeFormModal = () => {
        if (saving) {
            return;
        }

        setFormMode(null);
        setSelectedPatient(null);
        setServerErrors({});
    };

    const handleSubmitPatient = async (data) => {
        try {
            setSaving(true);
            setServerErrors({});

            if (formMode === 'create') {
                await api.post('/patients', data);

                showSuccess(
                    'Pasien berhasil ditambahkan.'
                );
            } else {
                await api.put(
                    `/patients/${selectedPatient.id}`,
                    data
                );

                showSuccess(
                    'Data pasien berhasil diperbarui.'
                );
            }

            closeFormModal();
            await fetchPatients();
        } catch (error) {
            const response =
                error.response?.data;

            if (response?.errors) {
                setServerErrors(
                    response.errors
                );
            } else {
                setServerErrors({
                    general:
                        response?.message ||
                        'Gagal menyimpan data pasien.',
                });
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDetail = async (id) => {
        try {
            setDetailLoading(true);
            setDetailPatient({});

            const response = await api.get(
                `/patients/${id}`
            );

            setDetailPatient(
                response.data.data
            );
        } catch (error) {
            setDetailPatient(null);

            setError(
                error.response?.data?.message ||
                    'Gagal mengambil detail pasien.'
            );
        } finally {
            setDetailLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deletePatient) {
            return;
        }

        try {
            setDeleting(true);

            await api.delete(
                `/patients/${deletePatient.id}`
            );

            showSuccess(
                'Data pasien berhasil dihapus.'
            );

            setDeletePatient(null);

            /*
             * Jika halaman terakhir menjadi kosong,
             * kembali ke halaman sebelumnya.
             */
            if (
                patients.length === 1 &&
                page > 1
            ) {
                setPage(
                    (previous) => previous - 1
                );
            } else {
                await fetchPatients();
            }
        } catch (error) {
            setError(
                error.response?.data?.message ||
                    'Data pasien tidak dapat dihapus.'
            );

            setDeletePatient(null);
        } finally {
            setDeleting(false);
        }
    };

    const formatDate = (value) => {
        if (!value) {
            return '-';
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return new Intl.DateTimeFormat(
            'id-ID',
            {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                timeZone: 'UTC',
            }
        ).format(date);
    };

    return (
        <div className="patient-container">
            <header className="page-header">
                <div>
                    <span className="page-eyebrow">
                        Master Data
                    </span>

                    <h1>Data Pasien</h1>

                    <p>
                        Kelola dan cari data pasien
                        yang terdaftar di klinik.
                    </p>
                </div>

                {canManagePatients && (
                    <button
                        type="button"
                        className="primary-button"
                        onClick={openCreateModal}
                    >
                        <Plus size={18} />
                        Tambah Pasien
                    </button>
                )}
            </header>

            {success && (
                <div className="success-alert">
                    {success}
                </div>
            )}

            {error && (
                <div className="dashboard-error">
                    <span>{error}</span>

                    <button
                        type="button"
                        onClick={() => {
                            setError('');
                            fetchPatients();
                        }}
                    >
                        Coba Lagi
                    </button>
                </div>
            )}

            <section className="content-card">
                <div className="table-toolbar">
                    <form
                        className="search-form"
                        onSubmit={handleSearch}
                    >
                        <div className="search-input">
                            <Search size={18} />

                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                                placeholder="Cari nama, NIK, atau nomor rekam medis..."
                            />
                        </div>

                        <button
                            type="submit"
                            className="secondary-button"
                        >
                            Cari
                        </button>

                        {keyword && (
                            <button
                                type="button"
                                className="text-button"
                                onClick={
                                    handleResetSearch
                                }
                            >
                                Reset
                            </button>
                        )}
                    </form>

                    <div className="table-summary">
                        <Users size={17} />

                        <span>
                            {pagination.total} pasien
                        </span>
                    </div>
                </div>

                {loading ? (
                    <div className="table-state">
                        Memuat data pasien...
                    </div>
                ) : patients.length === 0 ? (
                    <div className="table-state">
                        <Users size={36} />

                        <strong>
                            Data pasien tidak ditemukan
                        </strong>

                        <span>
                            Belum ada data atau hasil
                            pencarian tidak ditemukan.
                        </span>
                    </div>
                ) : (
                    <>
                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>No. RM</th>
                                        <th>NIK</th>
                                        <th>
                                            Nama Pasien
                                        </th>
                                        <th>
                                            Jenis Kelamin
                                        </th>
                                        <th>
                                            Tanggal Lahir
                                        </th>
                                        <th>Telepon</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {patients.map(
                                        (patient) => (
                                            <tr
                                                key={
                                                    patient.id
                                                }
                                            >
                                                <td>
                                                    <span className="record-number">
                                                        {
                                                            patient.medical_record_number
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    {
                                                        patient.nik
                                                    }
                                                </td>

                                                <td>
                                                    <strong>
                                                        {
                                                            patient.name
                                                        }
                                                    </strong>
                                                </td>

                                                <td>
                                                    {
                                                        patient.gender
                                                    }
                                                </td>

                                                <td>
                                                    {formatDate(
                                                        patient.date_of_birth
                                                    )}
                                                </td>

                                                <td>
                                                    {
                                                        patient.phone ||
                                                        '-'
                                                    }
                                                </td>

                                                <td>
                                                    <div className="action-buttons">
                                                        <button
                                                            type="button"
                                                            className="icon-button"
                                                            title="Detail"
                                                            onClick={() =>
                                                                handleDetail(
                                                                    patient.id
                                                                )
                                                            }
                                                        >
                                                            <Eye
                                                                size={
                                                                    17
                                                                }
                                                            />
                                                        </button>

                                                        {canManagePatients && (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    className="icon-button"
                                                                    title="Ubah"
                                                                    onClick={() =>
                                                                        openEditModal(
                                                                            patient
                                                                        )
                                                                    }
                                                                >
                                                                    <Pencil
                                                                        size={
                                                                            17
                                                                        }
                                                                    />
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    className="icon-button danger"
                                                                    title="Hapus"
                                                                    onClick={() =>
                                                                        setDeletePatient(
                                                                            patient
                                                                        )
                                                                    }
                                                                >
                                                                    <Trash2
                                                                        size={
                                                                            17
                                                                        }
                                                                    />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="pagination">
                            <span>
                                Halaman{' '}
                                <strong>
                                    {pagination.page}
                                </strong>{' '}
                                dari{' '}
                                <strong>
                                    {
                                        pagination.totalPages
                                    }
                                </strong>
                            </span>

                            <div className="pagination-actions">
                                <button
                                    type="button"
                                    disabled={
                                        page <= 1
                                    }
                                    onClick={() =>
                                        setPage(
                                            (
                                                previous
                                            ) =>
                                                previous -
                                                1
                                        )
                                    }
                                >
                                    <ChevronLeft
                                        size={17}
                                    />
                                    Sebelumnya
                                </button>

                                <button
                                    type="button"
                                    disabled={
                                        page >=
                                        pagination.totalPages
                                    }
                                    onClick={() =>
                                        setPage(
                                            (
                                                previous
                                            ) =>
                                                previous +
                                                1
                                        )
                                    }
                                >
                                    Berikutnya
                                    <ChevronRight
                                        size={17}
                                    />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </section>

            <PatientFormModal
                open={Boolean(formMode)}
                mode={formMode}
                patient={selectedPatient}
                loading={saving}
                serverErrors={serverErrors}
                onClose={closeFormModal}
                onSubmit={handleSubmitPatient}
            />

            <PatientDetailModal
                patient={detailPatient}
                loading={detailLoading}
                canManage={canManagePatients}
                onEdit={openEditModal}
                onClose={() =>
                    setDetailPatient(null)
                }
            />

            {deletePatient && (
                <div className="modal-backdrop">
                    <div className="modal-card confirm-modal">
                        <h2>Hapus Data Pasien?</h2>

                        <p>
                            Data{' '}
                            <strong>
                                {deletePatient.name}
                            </strong>{' '}
                            akan dihapus.
                        </p>

                        <p className="confirm-warning">
                            Data pasien yang sudah
                            mempunyai relasi pendaftaran
                            mungkin tidak dapat dihapus.
                        </p>

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={() =>
                                    setDeletePatient(
                                        null
                                    )
                                }
                                disabled={deleting}
                            >
                                Batal
                            </button>

                            <button
                                type="button"
                                className="danger-button"
                                onClick={handleDelete}
                                disabled={deleting}
                            >
                                {deleting
                                    ? 'Menghapus...'
                                    : 'Hapus Pasien'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientPage;