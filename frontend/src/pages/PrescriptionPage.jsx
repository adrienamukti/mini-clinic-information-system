import {
    ChevronLeft,
    ChevronRight,
    Eye,
    FileText,
    Pill,
    Search,
    Stethoscope,
    User,
    X,
} from 'lucide-react';

import {
    useEffect,
    useState,
} from 'react';

import api from '../services/api';

const PrescriptionPage = () => {
    /*
     * ============================
     * LIST STATE
     * ============================
     */

    const [
        prescriptions,
        setPrescriptions,
    ] = useState([]);

    const [
        pagination,
        setPagination,
    ] = useState({
        page: 1,
        limit: 10,
        total: 0,
        total_pages: 1,
    });

    const [
        searchInput,
        setSearchInput,
    ] = useState('');

    const [
        search,
        setSearch,
    ] = useState('');

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState('');

    /*
     * ============================
     * DETAIL STATE
     * ============================
     */

    const [
        selectedPrescription,
        setSelectedPrescription,
    ] = useState(null);

    const [
        detailLoading,
        setDetailLoading,
    ] = useState(false);

    const [
        detailError,
        setDetailError,
    ] = useState('');

    /*
     * ============================
     * FETCH PRESCRIPTION LIST
     * ============================
     */

    const fetchPrescriptions = async (
        page = 1,
        searchValue = search
    ) => {
        try {
            setLoading(true);
            setError('');

            const response =
                await api.get(
                    '/prescriptions',
                    {
                        params: {
                            page,
                            limit: 10,
                            search:
                                searchValue ||
                                undefined,
                        },
                    }
                );

            const payload =
                response.data?.data;

            const list =
                payload?.prescriptions ||
                [];

            const paginationData =
                payload?.pagination || {
                    page: 1,
                    limit: 10,
                    total: 0,
                    total_pages: 1,
                };

            setPrescriptions(
                list
            );

            setPagination(
                paginationData
            );
        } catch (error) {
            console.error(
                'Prescription list error:',
                error.response?.data ||
                error
            );

            setPrescriptions([]);

            setError(
                error.response?.data
                    ?.message ||
                'Gagal mengambil daftar resep.'
            );
        } finally {
            setLoading(false);
        }
    };

    /*
     * Fetch awal.
     */
    useEffect(() => {
        let isCancelled = false;

        const loadInitialPrescriptions =
            async () => {
                try {
                    const response =
                        await api.get(
                            '/prescriptions',
                            {
                                params: {
                                    page: 1,
                                    limit: 10,
                                },
                            }
                        );

                    if (isCancelled) {
                        return;
                    }

                    const payload =
                        response.data?.data;

                    const list =
                        payload
                            ?.prescriptions ||
                        [];

                    const paginationData =
                        payload?.pagination || {
                            page: 1,
                            limit: 10,
                            total: 0,
                            total_pages: 1,
                        };

                    setPrescriptions(
                        list
                    );

                    setPagination(
                        paginationData
                    );
                } catch (error) {
                    if (isCancelled) {
                        return;
                    }

                    console.error(
                        'Initial prescription error:',
                        error.response?.data ||
                        error
                    );

                    setPrescriptions([]);

                    setError(
                        error.response?.data
                            ?.message ||
                        'Gagal mengambil daftar resep.'
                    );
                } finally {
                    if (!isCancelled) {
                        setLoading(false);
                    }
                }
            };

        loadInitialPrescriptions();

        return () => {
            isCancelled = true;
        };
    }, []);

    /*
     * ============================
     * SEARCH
     * ============================
     */

    const handleSearch = (
        event
    ) => {
        event.preventDefault();

        const value =
            searchInput.trim();

        setSearch(value);

        fetchPrescriptions(
            1,
            value
        );
    };

    const handleResetSearch =
        () => {
            setSearchInput('');
            setSearch('');

            fetchPrescriptions(
                1,
                ''
            );
        };

    /*
     * ============================
     * DETAIL PRESCRIPTION
     * ============================
     */

    const handleDetail =
        async (
            prescriptionId
        ) => {
            try {
                setDetailLoading(
                    true
                );

                setDetailError('');

                setSelectedPrescription(
                    null
                );

                const response =
                    await api.get(
                        `/prescriptions/${prescriptionId}`
                    );

                const data =
                    response.data?.data;

                setSelectedPrescription(
                    data
                );
            } catch (error) {
                console.error(
                    'Prescription detail error:',
                    error.response
                        ?.data ||
                    error
                );

                setDetailError(
                    error.response?.data
                        ?.message ||
                    'Gagal mengambil detail resep.'
                );
            } finally {
                setDetailLoading(
                    false
                );
            }
        };

    const closeDetail = () => {
        setSelectedPrescription(
            null
        );

        setDetailError('');

        setDetailLoading(
            false
        );
    };

    /*
     * ============================
     * PAGINATION
     * ============================
     */

    const handlePreviousPage =
        () => {
            if (
                pagination.page <=
                1
            ) {
                return;
            }

            fetchPrescriptions(
                pagination.page - 1
            );
        };

    const handleNextPage =
        () => {
            if (
                pagination.page >=
                pagination.total_pages
            ) {
                return;
            }

            fetchPrescriptions(
                pagination.page + 1
            );
        };

    /*
     * ============================
     * HELPERS
     * ============================
     */

    const formatDate = (
        value
    ) => {
        if (!value) {
            return '-';
        }

        const date =
            new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return '-';
        }

        return new Intl
            .DateTimeFormat(
                'id-ID',
                {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    timeZone:
                        'Asia/Jakarta',
                }
            )
            .format(date);
    };

    const items =
        selectedPrescription
            ?.items || [];

    /*
     * ============================
     * RENDER
     * ============================
     */

    return (
        <div className="prescription-page">
            {/* HEADER */}
            <header className="page-header">
                <div>
                    <span className="page-eyebrow">
                        Dokter
                    </span>

                    <h1>
                        Resep Obat
                    </h1>

                    <p>
                        Lihat dan cari
                        resep pasien
                        berdasarkan nama,
                        nomor rekam medis,
                        diagnosa, atau
                        dokter.
                    </p>
                </div>
            </header>

            {/* SUMMARY */}
            <div className="prescription-summary">
                <div className="prescription-summary-icon">
                    <Pill
                        size={21}
                    />
                </div>

                <div>
                    <strong>
                        {
                            pagination.total
                        }
                    </strong>

                    <span>
                        Total resep
                        tersimpan
                    </span>
                </div>
            </div>

            {/* CONTENT */}
            <section className="content-card">
                {/* TOOLBAR */}
                <div className="prescription-list-toolbar">
                    <form
                        className="prescription-list-search"
                        onSubmit={
                            handleSearch
                        }
                    >
                        <div className="search-input">
                            <Search
                                size={18}
                            />

                            <input
                                type="text"
                                value={
                                    searchInput
                                }
                                onChange={(
                                    event
                                ) =>
                                    setSearchInput(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                placeholder="Cari nama pasien, No. RM, diagnosa..."
                            />
                        </div>

                        <button
                            type="submit"
                            className="primary-button"
                            disabled={
                                loading
                            }
                        >
                            <Search
                                size={16}
                            />

                            Cari
                        </button>

                        {(search ||
                            searchInput) && (
                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={
                                        handleResetSearch
                                    }
                                    disabled={
                                        loading
                                    }
                                >
                                    Reset
                                </button>
                            )}
                    </form>

                    <div className="prescription-result-count">
                        {
                            pagination.total
                        }
                        {' '}
                        resep
                    </div>
                </div>

                {/* ERROR */}
                {error && (
                    <div className="dashboard-error">
                        <span>
                            {error}
                        </span>

                        <button
                            type="button"
                            onClick={() =>
                                fetchPrescriptions(
                                    pagination.page
                                )
                            }
                        >
                            Coba Lagi
                        </button>
                    </div>
                )}

                {/* LOADING */}
                {loading ? (
                    <div className="table-state">
                        Memuat daftar
                        resep...
                    </div>
                ) : prescriptions.length ===
                    0 ? (
                    /* EMPTY */
                    <div className="table-state">
                        <FileText
                            size={40}
                        />

                        <strong>
                            {search
                                ? 'Resep tidak ditemukan'
                                : 'Belum ada resep'}
                        </strong>

                        <span>
                            {search
                                ? `Tidak ditemukan resep untuk "${search}".`
                                : 'Resep yang dibuat dokter akan muncul di halaman ini.'}
                        </span>
                    </div>
                ) : (
                    <>
                        {/* TABLE */}
                        <div className="table-wrapper">
                            <table className="data-table prescription-table">
                                <thead>
                                    <tr>
                                        <th>
                                            Tanggal
                                        </th>

                                        <th>
                                            Pasien
                                        </th>

                                        <th>
                                            Diagnosa
                                        </th>

                                        <th>
                                            Dokter
                                        </th>

                                        <th>
                                            Poli
                                        </th>

                                        <th>
                                            Obat
                                        </th>

                                        <th>
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {prescriptions.map(
                                        (
                                            prescription
                                        ) => (
                                            <tr
                                                key={
                                                    prescription.id
                                                }
                                            >
                                                {/* DATE */}
                                                <td>
                                                    {formatDate(
                                                        prescription.created_at
                                                    )}
                                                </td>

                                                {/* PATIENT */}
                                                <td>
                                                    <strong>
                                                        {
                                                            prescription.patient_name
                                                        }
                                                    </strong>

                                                    <span className="table-secondary-text">
                                                        {
                                                            prescription.medical_record_number
                                                        }
                                                    </span>
                                                </td>

                                                {/* DIAGNOSIS */}
                                                <td>
                                                    {
                                                        prescription.diagnosis ||
                                                        '-'
                                                    }
                                                </td>

                                                {/* DOCTOR */}
                                                <td>
                                                    {
                                                        prescription.doctor_name ||
                                                        '-'
                                                    }
                                                </td>

                                                {/* POLYCLINIC */}
                                                <td>
                                                    {
                                                        prescription.polyclinic_name ||
                                                        '-'
                                                    }
                                                </td>

                                                {/* TOTAL ITEM */}
                                                <td>
                                                    <span className="medicine-count-badge">
                                                        <Pill
                                                            size={
                                                                13
                                                            }
                                                        />

                                                        {
                                                            prescription.total_items
                                                        }
                                                        {' '}
                                                        obat
                                                    </span>
                                                </td>

                                                {/* ACTION */}
                                                <td>
                                                    <button
                                                        type="button"
                                                        className="secondary-button compact-button"
                                                        onClick={() => handleDetail(prescription.id)}
                                                        style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "6px",
                                                        }}
                                                    >
                                                        <Eye size={15} />
                                                        Lihat Resep
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINATION */}
                        <div className="prescription-pagination">
                            <div>
                                Halaman{' '}
                                <strong>
                                    {
                                        pagination.page
                                    }
                                </strong>{' '}
                                dari{' '}
                                <strong>
                                    {
                                        pagination.total_pages
                                    }
                                </strong>
                            </div>

                            <div className="pagination-buttons">
                                <button
                                    type="button"
                                    className="secondary-button compact-button"
                                    onClick={
                                        handlePreviousPage
                                    }
                                    disabled={
                                        pagination.page <=
                                        1 ||
                                        loading
                                    }
                                >
                                    <ChevronLeft
                                        size={
                                            16
                                        }
                                    />

                                    Sebelumnya
                                </button>

                                <button
                                    type="button"
                                    className="secondary-button compact-button"
                                    onClick={
                                        handleNextPage
                                    }
                                    disabled={
                                        pagination.page >=
                                        pagination.total_pages ||
                                        loading
                                    }
                                >
                                    Berikutnya

                                    <ChevronRight
                                        size={
                                            16
                                        }
                                    />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </section>

            {/* ===========================
                DETAIL MODAL
            ============================ */}

            {(detailLoading ||
                detailError ||
                selectedPrescription) && (
                    <div className="modal-backdrop">
                        <div className="modal-card prescription-detail-modal">
                            {/* MODAL HEADER */}
                            <div className="modal-header">
                                <div>
                                    <span className="page-eyebrow">
                                        Detail
                                        Resep
                                    </span>

                                    <h2>
                                        Resep
                                        Pasien
                                    </h2>

                                    {selectedPrescription && (
                                        <p className="modal-subtitle">
                                            {
                                                selectedPrescription.patient_name
                                            }
                                            {' · '}
                                            {
                                                selectedPrescription.medical_record_number
                                            }
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    className="modal-close"
                                    onClick={
                                        closeDetail
                                    }
                                >
                                    <X
                                        size={
                                            20
                                        }
                                    />
                                </button>
                            </div>

                            {/* DETAIL LOADING */}
                            {detailLoading && (
                                <div className="table-state">
                                    Memuat
                                    detail
                                    resep...
                                </div>
                            )}

                            {/* DETAIL ERROR */}
                            {!detailLoading &&
                                detailError && (
                                    <div className="prescription-page-error">
                                        {
                                            detailError
                                        }
                                    </div>
                                )}

                            {/* DETAIL CONTENT */}
                            {!detailLoading &&
                                selectedPrescription && (
                                    <div className="prescription-detail-body">
                                        {/* PATIENT */}
                                        <div className="prescription-patient-header">
                                            <div className="prescription-patient-icon">
                                                <User
                                                    size={
                                                        23
                                                    }
                                                />
                                            </div>

                                            <div>
                                                <span>
                                                    Pasien
                                                </span>

                                                <h3>
                                                    {
                                                        selectedPrescription.patient_name
                                                    }
                                                </h3>

                                                <p>
                                                    {
                                                        selectedPrescription.medical_record_number
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        {/* INFORMATION */}
                                        <div className="prescription-info-grid">
                                            <div>
                                                <span>
                                                    Tanggal
                                                </span>

                                                <strong>
                                                    {formatDate(
                                                        selectedPrescription.created_at
                                                    )}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Diagnosa
                                                </span>

                                                <strong>
                                                    {
                                                        selectedPrescription.diagnosis ||
                                                        '-'
                                                    }
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Dokter
                                                </span>

                                                <strong>
                                                    {
                                                        selectedPrescription.doctor_name ||
                                                        '-'
                                                    }
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Poli
                                                </span>

                                                <strong>
                                                    {
                                                        selectedPrescription.polyclinic_name ||
                                                        '-'
                                                    }
                                                </strong>
                                            </div>
                                        </div>

                                        {/* NOTES */}
                                        {selectedPrescription.notes && (
                                            <div className="prescription-notes">
                                                <span>
                                                    Catatan
                                                    Resep
                                                </span>

                                                <p>
                                                    {
                                                        selectedPrescription.notes
                                                    }
                                                </p>
                                            </div>
                                        )}

                                        {/* MEDICINE */}
                                        <div className="medicine-detail-list">
                                            <div className="medicine-list-heading">
                                                <div>
                                                    <Pill
                                                        size={
                                                            18
                                                        }
                                                    />

                                                    <h3>
                                                        Daftar
                                                        Obat
                                                    </h3>
                                                </div>

                                                <span>
                                                    {
                                                        items.length
                                                    }
                                                    {' '}
                                                    obat
                                                </span>
                                            </div>

                                            {items.map(
                                                (
                                                    item,
                                                    index
                                                ) => (
                                                    <article
                                                        className="medicine-detail-card"
                                                        key={
                                                            item.id ||
                                                            index
                                                        }
                                                    >
                                                        <div className="medicine-number">
                                                            {
                                                                index +
                                                                1
                                                            }
                                                        </div>

                                                        <div className="medicine-detail-content">
                                                            <h4>
                                                                {
                                                                    item.medicine_name
                                                                }
                                                            </h4>

                                                            <div className="medicine-information-grid">
                                                                <div>
                                                                    <span>
                                                                        Dosis
                                                                    </span>

                                                                    <strong>
                                                                        {
                                                                            item.dosage
                                                                        }
                                                                    </strong>
                                                                </div>

                                                                <div>
                                                                    <span>
                                                                        Frekuensi
                                                                    </span>

                                                                    <strong>
                                                                        {
                                                                            item.frequency
                                                                        }
                                                                    </strong>
                                                                </div>

                                                                <div>
                                                                    <span>
                                                                        Durasi
                                                                    </span>

                                                                    <strong>
                                                                        {
                                                                            item.duration ||
                                                                            '-'
                                                                        }
                                                                    </strong>
                                                                </div>

                                                                <div>
                                                                    <span>
                                                                        Jumlah
                                                                    </span>

                                                                    <strong>
                                                                        {
                                                                            item.quantity
                                                                        }
                                                                    </strong>
                                                                </div>

                                                                <div className="medicine-instruction">
                                                                    <span>
                                                                        Aturan
                                                                        Pakai
                                                                    </span>

                                                                    <strong>
                                                                        {
                                                                            item.instructions ||
                                                                            '-'
                                                                        }
                                                                    </strong>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </article>
                                                )
                                            )}
                                        </div>

                                        <div className="prescription-doctor-note">
                                            <Stethoscope
                                                size={
                                                    16
                                                }
                                            />

                                            Resep dibuat
                                            oleh{' '}
                                            <strong>
                                                {
                                                    selectedPrescription.doctor_name
                                                }
                                            </strong>
                                        </div>
                                    </div>
                                )}
                        </div>
                    </div>
                )}
        </div>
    );
};

export default PrescriptionPage;