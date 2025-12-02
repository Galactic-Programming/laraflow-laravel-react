<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Validation Language Lines
    |--------------------------------------------------------------------------
    |
    | The following language lines contain the default error messages used by
    | the validator class. Some of these rules have multiple versions such
    | as the size rules. Feel free to tweak each of these messages here.
    |
    */

    'accepted' => 'Vui lòng chấp nhận :attribute.',
    'accepted_if' => 'Vui lòng chấp nhận :attribute khi :other là :value.',
    'active_url' => ':attribute không phải là URL hợp lệ.',
    'after' => ':attribute phải là ngày sau :date.',
    'after_or_equal' => ':attribute phải là ngày sau hoặc bằng :date.',
    'alpha' => ':attribute chỉ được chứa chữ cái.',
    'alpha_dash' => ':attribute chỉ được chứa chữ cái, số, dấu gạch ngang và gạch dưới.',
    'alpha_num' => ':attribute chỉ được chứa chữ cái và số.',
    'any_of' => ':attribute không hợp lệ.',
    'array' => ':attribute phải là một mảng.',
    'ascii' => ':attribute chỉ được chứa ký tự chữ và số.',
    'before' => ':attribute phải là ngày trước :date.',
    'before_or_equal' => ':attribute phải là ngày trước hoặc bằng :date.',
    'between' => [
        'array' => ':attribute phải có từ :min đến :max phần tử.',
        'file' => ':attribute phải có dung lượng từ :min đến :max KB.',
        'numeric' => ':attribute phải có giá trị từ :min đến :max.',
        'string' => ':attribute phải có độ dài từ :min đến :max ký tự.',
    ],
    'boolean' => ':attribute phải là đúng hoặc sai.',
    'can' => ':attribute chứa giá trị không được phép.',
    'confirmed' => 'Xác nhận :attribute không khớp.',
    'contains' => ':attribute thiếu giá trị bắt buộc.',
    'current_password' => 'Mật khẩu không chính xác.',
    'date' => ':attribute không phải là ngày hợp lệ.',
    'date_equals' => ':attribute phải là ngày :date.',
    'date_format' => ':attribute không đúng định dạng :format.',
    'decimal' => ':attribute phải có :decimal chữ số thập phân.',
    'declined' => ':attribute phải bị từ chối.',
    'declined_if' => ':attribute phải bị từ chối khi :other là :value.',
    'different' => ':attribute và :other phải khác nhau.',
    'digits' => ':attribute phải có :digits chữ số.',
    'digits_between' => ':attribute phải có từ :min đến :max chữ số.',
    'dimensions' => ':attribute có kích thước hình ảnh không hợp lệ.',
    'distinct' => ':attribute có giá trị trùng lặp.',
    'doesnt_contain' => ':attribute không được chứa: :values.',
    'doesnt_end_with' => ':attribute không được kết thúc bằng: :values.',
    'doesnt_start_with' => ':attribute không được bắt đầu bằng: :values.',
    'email' => 'Vui lòng nhập địa chỉ email hợp lệ.',
    'encoding' => ':attribute phải được mã hóa bằng :encoding.',
    'ends_with' => ':attribute phải kết thúc bằng: :values.',
    'enum' => 'Giá trị đã chọn không hợp lệ.',
    'exists' => 'Giá trị đã chọn không hợp lệ.',
    'extensions' => ':attribute phải có phần mở rộng: :values.',
    'file' => ':attribute phải là một tệp.',
    'filled' => ':attribute không được để trống.',
    'gt' => [
        'array' => ':attribute phải có nhiều hơn :value phần tử.',
        'file' => ':attribute phải lớn hơn :value KB.',
        'numeric' => ':attribute phải lớn hơn :value.',
        'string' => ':attribute phải có nhiều hơn :value ký tự.',
    ],
    'gte' => [
        'array' => ':attribute phải có ít nhất :value phần tử.',
        'file' => ':attribute phải lớn hơn hoặc bằng :value KB.',
        'numeric' => ':attribute phải lớn hơn hoặc bằng :value.',
        'string' => ':attribute phải có ít nhất :value ký tự.',
    ],
    'hex_color' => ':attribute phải là mã màu hợp lệ.',
    'image' => ':attribute phải là hình ảnh.',
    'in' => 'Giá trị đã chọn không hợp lệ.',
    'in_array' => ':attribute phải tồn tại trong :other.',
    'in_array_keys' => ':attribute phải chứa một trong các khóa: :values.',
    'integer' => ':attribute phải là số nguyên.',
    'ip' => ':attribute phải là địa chỉ IP hợp lệ.',
    'ipv4' => ':attribute phải là địa chỉ IPv4 hợp lệ.',
    'ipv6' => ':attribute phải là địa chỉ IPv6 hợp lệ.',
    'json' => ':attribute phải là chuỗi JSON hợp lệ.',
    'list' => ':attribute phải là danh sách.',
    'lowercase' => ':attribute phải là chữ thường.',
    'lt' => [
        'array' => ':attribute phải có ít hơn :value phần tử.',
        'file' => ':attribute phải nhỏ hơn :value KB.',
        'numeric' => ':attribute phải nhỏ hơn :value.',
        'string' => ':attribute phải có ít hơn :value ký tự.',
    ],
    'lte' => [
        'array' => ':attribute không được có quá :value phần tử.',
        'file' => ':attribute phải nhỏ hơn hoặc bằng :value KB.',
        'numeric' => ':attribute phải nhỏ hơn hoặc bằng :value.',
        'string' => ':attribute không được dài quá :value ký tự.',
    ],
    'mac_address' => ':attribute phải là địa chỉ MAC hợp lệ.',
    'max' => [
        'array' => ':attribute không được có quá :max phần tử.',
        'file' => ':attribute không được lớn hơn :max KB.',
        'numeric' => ':attribute không được lớn hơn :max.',
        'string' => ':attribute không được dài quá :max ký tự.',
    ],
    'max_digits' => ':attribute không được có quá :max chữ số.',
    'mimes' => ':attribute phải là tệp có định dạng: :values.',
    'mimetypes' => ':attribute phải là tệp có định dạng: :values.',
    'min' => [
        'array' => ':attribute phải có ít nhất :min phần tử.',
        'file' => ':attribute phải có dung lượng ít nhất :min KB.',
        'numeric' => ':attribute phải có giá trị ít nhất :min.',
        'string' => ':attribute phải có ít nhất :min ký tự.',
    ],
    'min_digits' => ':attribute phải có ít nhất :min chữ số.',
    'missing' => ':attribute không được có mặt.',
    'missing_if' => ':attribute không được có mặt khi :other là :value.',
    'missing_unless' => ':attribute không được có mặt trừ khi :other là :value.',
    'missing_with' => ':attribute không được có mặt khi có :values.',
    'missing_with_all' => ':attribute không được có mặt khi có :values.',
    'multiple_of' => ':attribute phải là bội số của :value.',
    'not_in' => 'Giá trị đã chọn không hợp lệ.',
    'not_regex' => 'Định dạng :attribute không hợp lệ.',
    'numeric' => ':attribute phải là số.',
    'password' => [
        'letters' => ':attribute phải chứa ít nhất một chữ cái.',
        'mixed' => ':attribute phải chứa ít nhất một chữ hoa và một chữ thường.',
        'numbers' => ':attribute phải chứa ít nhất một chữ số.',
        'symbols' => ':attribute phải chứa ít nhất một ký tự đặc biệt.',
        'uncompromised' => ':attribute này đã bị lộ. Vui lòng chọn mật khẩu khác.',
    ],
    'present' => ':attribute phải có mặt.',
    'present_if' => ':attribute phải có mặt khi :other là :value.',
    'present_unless' => ':attribute phải có mặt trừ khi :other là :value.',
    'present_with' => ':attribute phải có mặt khi có :values.',
    'present_with_all' => ':attribute phải có mặt khi có :values.',
    'prohibited' => ':attribute không được phép.',
    'prohibited_if' => ':attribute không được phép khi :other là :value.',
    'prohibited_if_accepted' => ':attribute không được phép khi :other được chấp nhận.',
    'prohibited_if_declined' => ':attribute không được phép khi :other bị từ chối.',
    'prohibited_unless' => ':attribute không được phép trừ khi :other nằm trong :values.',
    'prohibits' => ':attribute không cho phép :other có mặt.',
    'regex' => 'Định dạng :attribute không hợp lệ.',
    'required' => 'Vui lòng nhập :attribute.',
    'required_array_keys' => ':attribute phải chứa các mục: :values.',
    'required_if' => ':attribute là bắt buộc khi :other là :value.',
    'required_if_accepted' => ':attribute là bắt buộc khi :other được chấp nhận.',
    'required_if_declined' => ':attribute là bắt buộc khi :other bị từ chối.',
    'required_unless' => ':attribute là bắt buộc trừ khi :other nằm trong :values.',
    'required_with' => ':attribute là bắt buộc khi có :values.',
    'required_with_all' => ':attribute là bắt buộc khi có :values.',
    'required_without' => ':attribute là bắt buộc khi không có :values.',
    'required_without_all' => ':attribute là bắt buộc khi không có :values nào.',
    'same' => ':attribute và :other phải giống nhau.',
    'size' => [
        'array' => ':attribute phải chứa :size phần tử.',
        'file' => ':attribute phải có dung lượng :size KB.',
        'numeric' => ':attribute phải bằng :size.',
        'string' => ':attribute phải có :size ký tự.',
    ],
    'starts_with' => ':attribute phải bắt đầu bằng: :values.',
    'string' => ':attribute phải là chuỗi ký tự.',
    'timezone' => ':attribute phải là múi giờ hợp lệ.',
    'unique' => ':attribute đã được sử dụng.',
    'uploaded' => 'Không thể tải lên :attribute.',
    'uppercase' => ':attribute phải là chữ hoa.',
    'url' => ':attribute không phải là URL hợp lệ.',
    'ulid' => ':attribute phải là ULID hợp lệ.',
    'uuid' => ':attribute phải là UUID hợp lệ.',

    /*
    |--------------------------------------------------------------------------
    | Custom Validation Language Lines
    |--------------------------------------------------------------------------
    */

    'custom' => [
        'attribute-name' => [
            'rule-name' => 'custom-message',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Custom Validation Attributes
    |--------------------------------------------------------------------------
    */

    'attributes' => [
        'name' => 'họ tên',
        'email' => 'email',
        'password' => 'mật khẩu',
        'password_confirmation' => 'xác nhận mật khẩu',
        'current_password' => 'mật khẩu hiện tại',
        'new_password' => 'mật khẩu mới',
        'avatar' => 'ảnh đại diện',
        'terms' => 'điều khoản',
    ],

];
