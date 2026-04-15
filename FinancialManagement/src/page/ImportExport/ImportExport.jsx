import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select/select";
import { Upload, FileText, FileSpreadsheet, File } from 'lucide-react';
import { Button } from '../../components/ui/button/button';
import { Badge } from '../../components/ui/badge/badge';
import { toast } from 'sonner';
import './ImportExport.scss'
import { Card, CardContent, CradTitle, CardHeader } from '../../components/ui/card/card';
import { Progress } from '../../components/ui/progress/progress';
import { Label } from '../../components/ui/label/label';

const importHistory = [
    {
        id: 1,
        filename: 'bank_statement_october.csv',
        format: 'CSV',
        date: '2025-10-25',
        status: 'success',
        records: 145,
    },
    {
        id: 2,
        filename: 'transactions_september.xlsx',
        format: 'Excel',
        date: '2025-10-01',
        status: 'success',
        records: 98,
    },
    {
        id: 3,
        filename: 'expenses_august.json',
        format: 'JSON',
        date: '2025-09-15',
        status: 'error',
        records: 0,
    },
];

const exportHistory = [
    {
        id: 1,
        filename: 'financial_report_2025.pdf',
        format: 'PDF',
        date: '2025-10-26',
        size: '2.3 MB',
    },
    {
        id: 2,
        filename: 'transactions_october.xlsx',
        format: 'Excel',
        date: '2025-10-20',
        size: '156 KB',
    },
    {
        id: 3,
        filename: 'full_backup.json',
        format: 'JSON',
        date: '2025-10-15',
        size: '1.8 MB',
    },
];

export default function ImportExport() {
    const [importing, setImporting] = useState(false)
    const [importProgress, setImportProgress] = useState(0)
    const [exportFormat, setExportFormat] = useState('csv')
    const [exportPeriod, setExportPeriod] = useState('month')

    const handleImport = () => {
        setImporting(true)
        setImportProgress(0)

        const interval = setInterval(() => {
            setImportProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval)
                    setImporting(false)
                    toast.success('Импорт завершён успешно')
                    return 100
                }
                return prev + 10
            })
        }, 200)
    }

    const handleExport = () => {
        toast.success(`Экспорт в формате ${exportFormat.toUpperCase()} начат`)
    }

    const handleFileUpload = () => {
        document.getElementById('file-input')?.click();
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case 'success':
                return <Badge variant="green">Успешно</Badge>;
            case 'error':
                return <Badge variant="red">Ошибка</Badge>;
            case 'pending':
                return <Badge variant="yellow">В процессе</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    }

    const getFormatIcon = (format) => {
        switch (format.toLowerCase()) {
            case 'csv':
                return <FileText className="icon" />;
            case 'excel':
            case 'xlsx':
                return <FileSpreadsheet className="icon" />;
            case 'json':
                return <File className="icon" />;
            default:
                return <File className="icon" />;
        }
    }

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

                {/* {Import} */}
                <TabsContent value="import" className="import-export__tab-content">
                    <div className="import-export__import-section">
                        <Card className="import-export__import-card">
                            <CardHeader>
                                <CradTitle className="text-lg">Импорт данных</CradTitle>
                            </CardHeader>
                            <CardContent className="import-export__import-card-content">
                                <div className="import-export__import-controls">
                                    <Upload className="import-export__icon" />
                                    <input
                                        type="file"
                                        id="file-input"
                                        className="hidden"
                                        accept=".csv,.xlsx,.xls,.json"
                                        onChange={handleImport}
                                    />
                                    <Button className="import-export__button" onClick={handleFileUpload} disabled={importing}>Выбрать файл</Button>
                                    <h4 className="import-export__instruction">Перетащите файл сюда или нажмите кнопку</h4>
                                    <p className="import-export__description">Поддерживаемые форматы: CSV, Excel, JSON</p>
                                </div>

                                {importing && (
                                    <div className="import-export__progress import-export__progress--visible">
                                        <div className='import-export__progress-text'>
                                            <span>Импорт данных...</span>
                                            <span>{importProgress}%</span>
                                        </div>
                                        <Progress value={importProgress} />
                                    </div>
                                )}

                                <div className="import-export__todo">
                                    <h4 className="import-export__todo-title">Формат файла</h4>
                                    <ul className="import-export__todo-list">
                                        <li>CSV: дата, категория, сумма, описание</li>
                                        <li>Excel: используйте шаблон для корректного импорта</li>
                                        <li>JSON: полный формат данных приложения</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* {Export} */}
                <TabsContent value="export" className="import-export__tab-content">
                    <div className="import-export__export-section">
                        <Card className="import-export__export-card">
                            <CardHeader>
                                <CradTitle className="text-lg">Экспорт данных</CradTitle>
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
                                        <Label className="import-export__label">Формат экспорта</Label>
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
                                        <div className="import-export__checkbox-item">
                                            <input type="checkbox" id="export-transactions" defaultChecked />
                                            <Label htmlFor="export-transactions">Операции</Label>
                                        </div>
                                        <div className="import-export__checkbox-item">
                                            <input type="checkbox" id="export-accounts" defaultChecked />
                                            <Label htmlFor="export-accounts">Счета</Label>
                                        </div>
                                        <div className="import-export__checkbox-item">
                                            <input type="checkbox" id="export-credits" defaultChecked />
                                            <Label htmlFor="export-credits">Кредиты</Label>
                                        </div>
                                        <div className="import-export__checkbox-item">
                                            <input type="checkbox" id="export-deposits" defaultChecked />
                                            <Label htmlFor="export-deposits">Вклады</Label>
                                        </div>
                                    </div>
                                </div>

                                <Button className="import-export__export-button">Экспортировать данные</Button>

                                <div className="import-export__quick-export">
                                    <h4 className="import-export__quick-export-title">Быстрый экспорт</h4>
                                    <div className="import-export__quick-export-buttons">
                                        <div className="import-export__quick-export-buttons">
                                            <Button variant="white" size="auto" onClick={() => { setExportFormat('pdf'); handleExport(); }}>Месячный отчет (PDF)</Button>
                                            <Button variant="white" size="auto" onClick={() => { setExportFormat('xlsx'); handleExport(); }}>Транзакции (Excel)</Button>
                                            <Button variant="white" size="auto" onClick={() => { setExportFormat('json'); handleExport(); }}>Полная копия (JSON)</Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* History */}
                <TabsContent value="history" className="import-export__tab-content">
                    <div className="import-export__history-section">
                        <Card className="card import-export__card">
                            <CardHeader>
                                <CradTitle className="text-lg">История импорта</CradTitle>
                            </CardHeader>

                            <CardContent className="import-export__card-content">
                                <div className="import-export__history-list">
                                    {importHistory.map((item) => (
                                        <div key={item.id} className="import-export__history-item">
                                            <div className="import-export__history-item-info">
                                                <div className="import-export__history-item-main">
                                                    {getFormatIcon(item.format)}
                                                    <div className="import-export__history-item-details">
                                                        <p className="import-export__history-filename">{item.filename}</p>
                                                        <p className="import-export__history-date">
                                                            {new Date(item.date).toLocaleDateString('ru-RU')} • {item.records} записей
                                                        </p>
                                                    </div>
                                                    <div className="import-export__history-item-status">
                                                        {getStatusBadge(item.status)}
                                                    </div>
                                                </div>

                                                <Button variant="transparent" className="import-export__history-item-action">Повторить импорт</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="card import-export__card">
                            <CardHeader>
                                <CradTitle className="text-lg">История экспорта</CradTitle>
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
    )
}