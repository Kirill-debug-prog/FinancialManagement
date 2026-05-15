import React, { useState, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select/select";
import { Upload, FileText, FileSpreadsheet, File, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/button/button';
import { Badge } from '../../components/ui/badge/badge';
import { toast } from 'sonner';
import './ImportExport.scss'
import { Card, CardContent, CardTitle, CardHeader } from '../../components/ui/card/card';
import { Progress } from '../../components/ui/progress/progress';
import { Label } from '../../components/ui/label/label';
import { getAccounts } from '../../api/accounts';
import { importBankStatement } from '../../api/import';
import { createTransactionsReport, createCategoryBreakdownReport, createObligationsReport, getReportDownloadUrl, waitForReport } from '../../api/reportExport';

export default function ImportExport() {
    const [wallets, setWallets] = useState([]);
    const [selectedWalletId, setSelectedWalletId] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState(null);
    const [exportFormat, setExportFormat] = useState('transactions');
    const [exportPeriod, setExportPeriod] = useState('month');
    const [exporting, setExporting] = useState(false);
    const [exportHistory, setExportHistory] = useState([]);
    const fileInputRef = useRef(null);

    useEffect(() => {
        getAccounts()
            .then(data => {
                setWallets(data || []);
                if (data?.length > 0) setSelectedWalletId(data[0].id);
            })
            .catch(() => setWallets([]));
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) setSelectedFile(file);
    };

    const handleImport = async () => {
        if (!selectedFile) {
            toast.error('Выберите файл для импорта');
            return;
        }
        if (!selectedWalletId) {
            toast.error('Выберите счёт для импорта');
            return;
        }

        setImporting(true);
        setImportResult(null);

        try {
            const result = await importBankStatement(selectedWalletId, selectedFile);
            setImportResult(result);
            toast.success(`Импортировано ${result.imported} транзакций`);
        } catch (err) {
            toast.error(err.message || 'Ошибка импорта');
        } finally {
            setImporting(false);
        }
    };

    const handleExport = async () => {
        if (exporting) return;
        
        const { dateFrom, dateTo } = getPeriodDates(exportPeriod);
        setExporting(true);
        const toastId = toast.loading('Подготовка экспорта...');
        
        try {
            let result;

            // Выбираем функцию создания отчета в зависимости от типа
            if (exportFormat === 'transactions') {
                result = await createTransactionsReport(dateFrom, dateTo);
            } else if (exportFormat === 'categories') {
                result = await createCategoryBreakdownReport(dateFrom, dateTo);
            } else if (exportFormat === 'obligations') {
                result = await createObligationsReport(dateFrom, dateTo);
            }

            // Получаем URL для скачивания
            if (result?.reportId) {
                toast.loading('Генерация файла (ожидание)...', { id: toastId });
                
                // Ждем готовности отчета
                try {
                    await waitForReport(result.reportId);
                } catch (waitErr) {
                    throw new Error(`Отчет не готов: ${waitErr.message}`);
                }
                
                // Теперь получаем URL скачивания
                toast.loading('Получение ссылки на скачивание...', { id: toastId });
                const downloadResult = await getReportDownloadUrl(result.reportId);
                const downloadUrl = downloadResult.downloadUrl || downloadResult.url;
                
                // Добавляем в историю
                const newExport = {
                    id: Date.now(),
                    filename: `report_${exportFormat}_${new Date().getTime()}.pdf`,
                    format: 'PDF',
                    date: new Date().toISOString().split('T')[0],
                    size: '—',
                    downloadUrl
                };
                setExportHistory(prev => [newExport, ...prev]);
                
                // Скачиваем файл
                if (downloadUrl) {
                    window.open(downloadUrl, '_blank');
                }
                toast.success('Отчет готов и скачивается!', { id: toastId });
            } else {
                toast.success('Отчет создан!', { id: toastId });
            }
        } catch (err) {
            toast.error(err.message || 'Ошибка экспорта', { id: toastId });
        } finally {
            setExporting(false);
        }
    };

    const getPeriodDates = (period) => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const formatDate = (date) => {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        };

        switch (period) {
            case 'week': {
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - 7);
                return { dateFrom: formatDate(weekStart), dateTo: formatDate(today) };
            }
            case 'month': {
                const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                return { dateFrom: formatDate(monthStart), dateTo: formatDate(today) };
            }
            case 'quarter': {
                const quarter = Math.floor(today.getMonth() / 3);
                const quarterStart = new Date(today.getFullYear(), quarter * 3, 1);
                return { dateFrom: formatDate(quarterStart), dateTo: formatDate(today) };
            }
            case 'year': {
                const yearStart = new Date(today.getFullYear(), 0, 1);
                return { dateFrom: formatDate(yearStart), dateTo: formatDate(today) };
            }
            case 'all':
            default:
                return { dateFrom: null, dateTo: null };
        }
    };

    const getExtensionForFormat = (format) => {
        switch (format) {
            case 'csv': return 'csv';
            case 'xlsx': return 'xlsx';
            case 'pdf': return 'pdf';
            case 'json': return 'json';
            default: return 'txt';
        }
    };

    const getFormatLabel = (format) => {
        switch (format) {
            case 'csv': return 'CSV';
            case 'xlsx': return 'Excel';
            case 'pdf': return 'PDF';
            case 'json': return 'JSON';
            default: return format.toUpperCase();
        }
    };

    const getFormatIcon = (format) => {
        switch (format.toLowerCase()) {
            case 'pdf': return <FileText className="icon" />;
            default: return <File className="icon" />;
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('ru-RU');
    };

    return (
        <div className="import-export">
            <div className="import-export__header">
                <h1 className="import-export__title">Импорт данных и отчеты</h1>
                <p className="import-export__subtitle">Работа с внешними данными и создание аналитических отчетов</p>
            </div>

            <Tabs defaultValue="import" className="import-export__tabs">
                <TabsList className="import-export__tabs-list">
                    <TabsTrigger value="import" className="import-export__tab">Импорт</TabsTrigger>
                    <TabsTrigger value="export" className="import-export__tab">Отчеты</TabsTrigger>
                    <TabsTrigger value="history" className="import-export__tab">История</TabsTrigger>
                </TabsList>

                <TabsContent value="import" className="import-export__tab-content">
                    <div className="import-export__import-section">
                        <Card className="import-export__import-card">
                            <CardHeader>
                                <CardTitle className="text-lg">Импорт выписки из банка</CardTitle>
                            </CardHeader>
                            <CardContent className="import-export__import-card-content">

                                <div className="import-export__select-group">
                                    <Label className="import-export__label">Счёт для импорта</Label>
                                    <Select value={selectedWalletId} onValueChange={setSelectedWalletId}>
                                        <SelectTrigger className="import-export__select-trigger">
                                            <SelectValue placeholder="Выберите счёт" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {wallets.map(w => (
                                                <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="import-export__import-controls">
                                    <Upload className="import-export__icon" />
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        className="hidden"
                                        accept=".pdf"
                                        onChange={handleFileChange}
                                    />
                                    <Button
                                        className="import-export__button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={importing}
                                    >
                                        Выбрать файл
                                    </Button>
                                    {selectedFile
                                        ? <p className="import-export__description">{selectedFile.name}</p>
                                        : <p className="import-export__description">Поддерживается формат PDF (выписка Сбербанк)</p>
                                    }
                                </div>

                                {importing && (
                                    <div className="import-export__progress import-export__progress--visible">
                                        <div className='import-export__progress-text'>
                                            <span>Обработка документа...</span>
                                        </div>
                                        <Progress value={null} />
                                    </div>
                                )}

                                {importResult && (
                                    <div className="import-export__result">
                                        <CheckCircle2 className="import-export__result-icon" />
                                        <div className="import-export__result-details">
                                            <p className="import-export__result-title">
                                                Импортировано {importResult.imported} транзакций
                                            </p>
                                            {importResult.dateFrom && importResult.dateTo && (
                                                <p className="import-export__result-period">
                                                    Период: {formatDate(importResult.dateFrom)} — {formatDate(importResult.dateTo)}
                                                </p>
                                            )}
                                            {importResult.skipped > 0 && (
                                                <p className="import-export__result-skipped">
                                                    Пропущено: {importResult.skipped}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <Button
                                    className="import-export__button"
                                    onClick={handleImport}
                                    disabled={importing || !selectedFile || !selectedWalletId}
                                >
                                    {importing ? 'Импорт...' : 'Начать импорт'}
                                </Button>

                                <div className="import-export__todo">
                                    <h4 className="import-export__todo-title">Как получить выписку</h4>
                                    <ul className="import-export__todo-list">
                                        <li>Откройте СберБанк Онлайн → раздел «Выписки и справки»</li>
                                        <li>Выберите карту и период, скачайте PDF</li>
                                        <li>Загрузите файл выше</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="export" className="import-export__tab-content">
                    <div className="import-export__export-section">
                        <Card className="import-export__export-card">
                            <CardHeader>
                                <CardTitle className="text-lg">Создание отчетов</CardTitle>
                            </CardHeader>
                            <CardContent className="import-export__export-card-content">
                                <div className="import-export__controls">
                                    <div className="import-export__select-group">
                                        <Label className="import-export__label">Тип отчета</Label>
                                        <Select value={exportFormat} onValueChange={setExportFormat}>
                                            <SelectTrigger className="import-export__select-trigger">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="transactions">Отчет по транзакциям</SelectItem>
                                                <SelectItem value="categories">Разбивка по категориям</SelectItem>
                                                <SelectItem value="obligations">Финансовые обязательства</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="import-export__select-group">
                                        <Label className="import-export__label">Период</Label>
                                        <Select value={exportPeriod} onValueChange={setExportPeriod}>
                                            <SelectTrigger className="import-export__select-trigger">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="week">Последняя неделя</SelectItem>
                                                <SelectItem value="month">Последний месяц</SelectItem>
                                                <SelectItem value="quarter">Последний квартал</SelectItem>
                                                <SelectItem value="year">Последний год</SelectItem>
                                                <SelectItem value="all">Все данные</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Button className="import-export__export-button" onClick={handleExport} disabled={exporting}>
                                    {exporting ? 'Создание отчета...' : 'Создать отчет'}
                                </Button>

                                <div className="import-export__quick-export">
                                    <h4 className="import-export__quick-export-title">Быстрые отчеты</h4>
                                    <div className="import-export__quick-export-buttons">
                                        <Button 
                                            variant="white" 
                                            size="auto" 
                                            disabled={exporting}
                                            onClick={() => { setExportFormat('transactions'); setTimeout(() => handleExport(), 0); }}
                                        >
                                            Транзакции (PDF)
                                        </Button>
                                        <Button 
                                            variant="white" 
                                            size="auto" 
                                            disabled={exporting}
                                            onClick={() => { setExportFormat('categories'); setTimeout(() => handleExport(), 0); }}
                                        >
                                            Категории (PDF)
                                        </Button>
                                        <Button 
                                            variant="white" 
                                            size="auto" 
                                            disabled={exporting}
                                            onClick={() => { setExportFormat('obligations'); setTimeout(() => handleExport(), 0); }}
                                        >
                                            Обязательства (PDF)
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="history" className="import-export__tab-content">
                    <div className="import-export__history-section">
                        <Card className="card import-export__card">
                            <CardHeader>
                                <CardTitle className="text-lg">История отчетов</CardTitle>
                            </CardHeader>
                            <CardContent className="import-export__card-content">
                                <div className="import-export__history-list">
                                    {exportHistory.map((item) => (
                                        <div key={item.id} className="import-export__history-item">
                                            <div className="import-export__history-item-info">
                                                <div className="import-export__history-item-main">
                                                    {getFormatIcon(item.format)}
                                                    <div className="import-export__history-item-details">
                                                        <p className="import-export__history-filename">{item.filename}</p>
                                                        <p className="import-export__history-date">
                                                            {new Date(item.date).toLocaleDateString('ru-RU')} • {item.size}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button 
                                                    variant="transparent" 
                                                    className="import-export__history-item-action"
                                                    onClick={() => item.downloadUrl && window.open(item.downloadUrl, '_blank')}
                                                    disabled={!item.downloadUrl}
                                                >
                                                    Скачать
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
