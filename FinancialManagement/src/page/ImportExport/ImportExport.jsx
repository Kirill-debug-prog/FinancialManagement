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

const exportHistory = [
    { id: 1, filename: 'financial_report_2025.pdf', format: 'PDF', date: '2025-10-26', size: '2.3 MB' },
    { id: 2, filename: 'transactions_october.xlsx', format: 'Excel', date: '2025-10-20', size: '156 KB' },
    { id: 3, filename: 'full_backup.json', format: 'JSON', date: '2025-10-15', size: '1.8 MB' },
];

export default function ImportExport() {
    const [wallets, setWallets] = useState([]);
    const [selectedWalletId, setSelectedWalletId] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState(null);
    const [exportFormat, setExportFormat] = useState('csv');
    const [exportPeriod, setExportPeriod] = useState('month');
    const [exportCheckboxes, setExportCheckboxes] = useState({
        transactions: true, accounts: true, credits: true, deposits: true,
    });
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

    const handleExport = () => {
        toast.success(`Экспорт в формате ${exportFormat.toUpperCase()} начат`);
    };

    const handleCheckboxChange = (name) => {
        setExportCheckboxes(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const getFormatIcon = (format) => {
        switch (format.toLowerCase()) {
            case 'csv': return <FileText className="icon" />;
            case 'excel': case 'xlsx': return <FileSpreadsheet className="icon" />;
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
                <h1 className="import-export__title">Импорт и экспорт данных</h1>
                <p className="import-export__subtitle">Работа с внешними данными и синхронизация</p>
            </div>

            <Tabs defaultValue="import" className="import-export__tabs">
                <TabsList className="import-export__tabs-list">
                    <TabsTrigger value="import" className="import-export__tab">Импорт</TabsTrigger>
                    <TabsTrigger value="export" className="import-export__tab">Экспорт</TabsTrigger>
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
                                <CardTitle className="text-lg">Экспорт данных</CardTitle>
                            </CardHeader>
                            <CardContent className="import-export__export-card-content">
                                <div className="import-export__controls">
                                    <div className="import-export__select-group">
                                        <Label className="import-export__label">Формат экспорта</Label>
                                        <Select value={exportFormat} onValueChange={setExportFormat}>
                                            <SelectTrigger className="import-export__select-trigger">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="csv">CSV (таблица)</SelectItem>
                                                <SelectItem value="xlsx">Excel (таблица)</SelectItem>
                                                <SelectItem value="pdf">PDF (отчёт)</SelectItem>
                                                <SelectItem value="json">JSON (полные данные)</SelectItem>
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

                                <div className="import-export__export-group">
                                    <Label className="import-export__label">Что экспортировать</Label>
                                    <div className="import-export__checkbox-group">
                                        {[['transactions', 'Операции'], ['accounts', 'Счета'], ['credits', 'Кредиты'], ['deposits', 'Вклады']].map(([key, label]) => (
                                            <div key={key} className="import-export__checkbox-item">
                                                <input
                                                    type="checkbox"
                                                    id={`export-${key}`}
                                                    checked={exportCheckboxes[key]}
                                                    onChange={() => handleCheckboxChange(key)}
                                                />
                                                <Label htmlFor={`export-${key}`}>{label}</Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Button className="import-export__export-button" onClick={handleExport}>
                                    Экспортировать данные
                                </Button>

                                <div className="import-export__quick-export">
                                    <h4 className="import-export__quick-export-title">Быстрый экспорт</h4>
                                    <div className="import-export__quick-export-buttons">
                                        <Button variant="white" size="auto" onClick={() => { setExportFormat('pdf'); handleExport(); }}>Месячный отчет (PDF)</Button>
                                        <Button variant="white" size="auto" onClick={() => { setExportFormat('xlsx'); handleExport(); }}>Транзакции (Excel)</Button>
                                        <Button variant="white" size="auto" onClick={() => { setExportFormat('json'); handleExport(); }}>Полная копия (JSON)</Button>
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
                                <CardTitle className="text-lg">История экспорта</CardTitle>
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
                                                <Button variant="transparent" className="import-export__history-item-action">Скачать</Button>
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
